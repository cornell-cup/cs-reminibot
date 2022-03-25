"""
Base Station for the MiniBot.
"""

from basestation.bot import Bot
from basestation.controller.minibot_sim_gui_adapter import run_program_string_for_gui_data
from basestation.user_database import Submission, User
from basestation import db
from basestation.util.stoppable_thread import StoppableThread, ThreadSafeVariable
from basestation.util.helper_functions import distance

from random import choice, randint
from string import digits, ascii_lowercase, ascii_uppercase
from typing import Dict, List, Tuple, Optional
import os
import re
import socket
import sys
import time
import threading
import pyaudio
import speech_recognition as sr
from copy import deepcopy

from basestation.util.units import AngleUnits, LengthUnits, convert_angle, convert_length




MAX_VISION_LOG_LENGTH = 1000
VISION_UPDATE_FREQUENCY = 30
VISION_DATA_HOLD_THRESHOLD = 1


def make_thread_safe(func):
    """ Decorator which wraps the specified function with a lock.  This makes
    sure that there aren't concurrent calls to the basestation functions.  The
    reason we need this is because both SpeechRecognition and the regular 
    movement buttons call basestation functions to make the Minibot move.  The
    SpeechRecognition function runs in its own background thread.  We 
    do not want the SpeechRecognition function calling the basestation functions
    while the movement button requests are calling them.  Hence we protect 
    the necessary basestation functions with a lock that is owned by the basestation
    Arguments:
         func: The function that will become thread safe
    """
    def decorated_func(*args, **kwargs):
        # args[0] is self for any basestation member function
        assert isinstance(args[0], BaseStation)
        lock = args[0].lock
        lock.acquire()
        val = func(*args, **kwargs)
        lock.release()
        return val
    return decorated_func


class BaseStation:
    def __init__(self, app_debug=False):
        self.active_bots = {}
        self.vision_log = []
        self.virtual_objects = {}
        self.vision_snapshot = {}
        self.vision_object_map = {}

        self.blockly_function_map = {
            "move_forward": "fwd",         "move_backward": "back",
            "move_forward_distance": "fwd_dst",         "move_backward_distance": "back_dst",
            "move_to": "move_to",
            "wait": "time.sleep",          "stop": "stop",
            "set_wheel_power":             "ECE_wheel_pwr",
            "turn_clockwise": "right",     "turn_counter_clockwise": "left",
            "turn_clockwise_angle": "right_angle",     "turn_counter_clockwise_angle": "left_angle",
            "turn_to": "turn_to",
            "move_servo": "move_servo",    "read_ultrasonic": "read_ultrasonic",

        }
        # functions that run continuously, and hence need to be started
        # in a new thread on the Minibot otherwise the Minibot will get
        # stuck in an infinite loop and will be unable to receive
        # other commands
        self.blockly_threaded_functions = [
            "fwd", "back", "right", "left", "stop", "ECE_wheel_pwr"
        ]

        # This socket is used to listen for new incoming Minibot broadcasts
        # The Minibot broadcast will allow us to learn the Minibot's ipaddress
        # so that we can connect to the Minibot
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # an arbitrarily small time
        self.sock.settimeout(0.01)

        # empty string means 0.0.0.0, which is all IP addresses on the local
        # machine, because some machines can have multiple Network Interface
        # Cards, and therefore will have multiple ip_addresses
        server_address = ("0.0.0.0", 5001)
        

        self.vision_monitior_thread = threading.Thread(
            target=self.vision_monitior, daemon=True
        )

        
        # checks if vision can see april tag by checking lenth of vision_log
        self.vision_monitior_thread.start()
        # self.connections = BaseConnection()

        # only bind in debug mode if you are the debug server, if you are the
        # monitoring program which restarts the debug server, do not bind,
        # otherwise the debug server won't be able to bind
        try:
            if app_debug and os.environ and os.environ["WERKZEUG_RUN_MAIN"] == "true":
                self.sock.bind(server_address)
            else:
                # since we are running in debug mode, always bind
                self.sock.bind(server_address)
        except:
            pass

        self._login_email = None
        self.speech_recog_thread = None
        self.lock = threading.Lock()

        # Keep track of any built-in scripts that are running / should run next
        self.builtin_script_state = {
            "procs": dict(),
            "next_req_id": 0
        }

    # ==================== VISION ====================
    def delete_virtual_room(self, virtual_room_id):
        """ Removes a virtual room given its virtual room id """
        self.virtual_objects.pop(virtual_room_id,None)
        self.vision_object_map.pop(virtual_room_id,None)

    def update_virtual_objects(self, update):
        """ Updates vision virtual objects list. """
        if "virtual_objects" in update and "add" in update and type(update["virtual_objects"]) is list and len(update["virtual_objects"]) > 0:
            if update["add"]:
                self.add_multiple_to_virtual_objects(update["virtual_objects"])
            else:
                self.remove_multiple_from_virtual_objects(update["virtual_objects"])
        elif "virtual_object" in update and "add" in update:
            if update["add"]:
                self.add_to_virtual_objects(update["virtual_object"])
            else:
                self.remove_from_virtual_objects(update["virtual_object"])
        else:
            print("The vision virtual object list was not given a valid update in update_virtual_objects")
            

    def add_to_virtual_objects(self, virtual_object):
        """ Adds single virtual object to virtual objects list """
        if "id" in virtual_object and "name" in virtual_object and "type" in virtual_object and "x" in virtual_object and "y" in virtual_object and "orientation" in virtual_object and "virtual_room_id" in virtual_object:
            if not (virtual_object["virtual_room_id"] in self.virtual_objects):
                self.virtual_objects[virtual_object["virtual_room_id"]] = {}
            self.virtual_objects[virtual_object["virtual_room_id"]][virtual_object["id"]] = {
                "name": virtual_object["name"], 
                "type": virtual_object["type"],   
                "is_physical": False,
                "x": virtual_object["x"],  
                "y": virtual_object["y"],  
                "orientation": virtual_object["orientation"],                        
                "length": virtual_object["length"] if "length" in virtual_object else None, 
                "width": virtual_object["width"] if "width" in virtual_object else None, 
                "radius": virtual_object["radius"] if "radius" in virtual_object else None, 
                "height": virtual_object["height"] if "height" in virtual_object else None, 
                "shape": virtual_object["shape"] if "shape" in virtual_object else None, 
                "color": virtual_object["color"] if "color" in virtual_object else None,
                "deltas_to_vertices": virtual_object["deltas_to_vertices"] if "deltas_to_vertices" in virtual_object else None, 
                "radiusY": virtual_object["radiusY"] if "radiusY" in virtual_object else None,  
            }
        else:
            print("The vision virtual object list was not given a valid update in add_to_virtual_objects")

    # to be used for simulation
    def add_minibot_to_virtual_objects(self, id, x, y, orientation):
        """ Adds a minibot to the list of virtual objects given an id, x coordinate, y coordinate, and orientation
            NOTE: This method is also used to update the position of the virtual minibot with the given id using 
            with the given x coordinate, y coordinate, and orientation.
        """
        minibot_virtual_object = {
            "id": id,
            "name": "minibot"+str(id), 
            "type": "minibot",   
            "x": x,  
            "y": y,  
            "orientation": orientation
        }
        self.add_to_virtual_objects(minibot_virtual_object)

    def add_multiple_to_virtual_objects(self, virtual_objects):
        """ Adds multiple virtual objects to virtual objects list """
        for value in virtual_objects:
            self.add_to_virtual_objects(value)
    
    def remove_from_virtual_objects(self, virtual_object):
        """ Removes single virtual object from virtual objects list """
        if "virtual_room_id" in virtual_object and virtual_object["virtual_room_id"] in self.virtual_objects and "id" in virtual_object:
            self.virtual_objects[virtual_object["virtual_room_id"]].pop(virtual_object["id"], None)
        else:
            print("The vision virtual object list was not given a valid removal update")

    def remove_multiple_from_virtual_objects(self, virtual_objects):
        """ Removes multiple virtual objects from virtual objects list """
        for value in virtual_objects:
            self.remove_from_virtual_objects(value)


    def update_vision_snapshot(self, value):
        """ Adds value to vision snapshot based on device id"""
        self.vision_snapshot[value["DEVICE_ID"]] = {"DEVICE_CENTER_X": value["DEVICE_CENTER_X"], "DEVICE_CENTER_Y": value["DEVICE_CENTER_Y"], "TIMESTAMP": value["TIMESTAMP"], "position_data" : value["position_data"]}


    def update_vision_object_map(self, update):
        """ Updates vision object mapping. """
        if "mappings" in update and "add" in update and type(update["mappings"]) is list and len(update["mappings"]) > 0:
            if update["add"]:
                self.remove_multiple_from_vision_object_map(update["mappings"])
                self.add_multiple_to_vision_object_map(update["mappings"])
            else:
                self.remove_multiple_from_vision_object_map(update["mappings"])
        elif "mapping" in update and "add" in update:
            if update["add"]:
                self.remove_from_vision_object_map(update["mapping"])
                self.add_to_vision_object_map(update["mapping"])
            else:
                self.remove_from_vision_object_map(update["mapping"])
        else:
            print("The vision object map was not given a valid update")
            

    def add_to_vision_object_map(self, object_mapping):
        """ Adds single mapping from the vision object map based on mapping's id """
        if "id" in object_mapping and "name" in object_mapping and "type" in object_mapping and "virtual_room_id" in object_mapping:
            if not (object_mapping["virtual_room_id"] in self.vision_object_map):
                self.vision_object_map[object_mapping["virtual_room_id"]] = {}
            self.vision_object_map[object_mapping["virtual_room_id"]][object_mapping["id"]] = {
                "name": object_mapping["name"], 
                "type": object_mapping["type"],                         
                "length": object_mapping["length"] if "length" in object_mapping else None, 
                "width": object_mapping["width"] if "width" in object_mapping else None, 
                "radius": object_mapping["radius"] if "radius" in object_mapping else None, 
                "height": object_mapping["height"] if "height" in object_mapping else None, 
                "shape": object_mapping["shape"] if "shape" in object_mapping else None, 
                "color": object_mapping["color"] if "color" in object_mapping else None, 
                "deltas_to_vertices": object_mapping["deltas_to_vertices"] if "deltas_to_vertices" in object_mapping else None, 
                "radiusY": object_mapping["radiusY"] if "radiusY" in object_mapping else None, 
            }
        else:
            print("The vision object map was not given a valid update")

    def add_multiple_to_vision_object_map(self, object_mappings):
        """ Adds multiple mappings from the vision object map based on mappings' ids """
        for value in object_mappings:
            self.add_to_vision_object_map(value)
    
    def remove_from_vision_object_map(self, object_mapping):
        """ Removes single mapping from the vision object map based on mapping's id """
        if "virtual_room_id" in object_mapping and object_mapping["virtual_room_id"] in self.vision_object_map and "id" in object_mapping:
            self.vision_object_map[object_mapping["virtual_room_id"]].pop(object_mapping["id"], None)
        else:
            print("The vision object map was not given a valid update")

    def remove_multiple_from_vision_object_map(self, object_mappings):
        """ Removes multiple mappings from the vision object map based on mappings' ids """
        for value in object_mappings:
            self.remove_from_vision_object_map(value)
        
    def get_raw_vision_data(self):
        """ Returns most recent vision data """
        return self.vision_snapshot if self.vision_snapshot else None
    
    def get_vision_data(self, query_params):
        """ Returns most recent vision data """
        return list(filter(lambda data_entry: self.matchesQuery(data_entry, query_params), self.get_estimated_positions(True, query_params["virtual_room_id"]))) 

    def matchesQuery(self, data_entry, query_params):
        matches = True
        if query_params != None:
            if "ids" in query_params:
                matches &= data_entry["id"] in query_params["ids"]
            if "id" in query_params:
                matches &= data_entry["id"] == query_params["id"]
        return matches

            

    # to be used for simulation
    def get_vision_data_by_id(self, id):
        """ Returns position data of an object given its id """
        allVisionData = self.get_vision_data()
        for object in allVisionData:
            if object["id"] == id:
                return object
        print("Warning: Vision data for the object with the given ID could not be found")
        return None

    def get_vision_data_by_ids(self, ids):
        """ Returns position data of multiple objects given a list of ids """
        allVisionData = self.get_vision_data()
        objects = []
        for object in allVisionData:
            if object["id"] == ids:
                objects.append(object)
        if len(objects) < len(ids):
            print("Warning: Vision data for some of the objects with the given ID could not be found")
        return objects

    def get_vision_object_map(self):
        """ Returns the mapping of vision objects to their corresponding ids """
        return self.vision_object_map if self.vision_object_map else {}

    def get_virtual_objects(self):
        """ Returns the dictionary of virtual objects """
        return self.virtual_objects if self.virtual_objects else {}

    def get_estimated_positions(self, use_vision_log=False, virtual_room_id=None):
        """ Returns the estimated positions of all apriltags detected by all cameras based on vision snapshot data """
        object_positions = {}
        estimated_positions = []
        for device_id, device_data in self.vision_snapshot.items():
            for position_entry in device_data["position_data"]:
                if not (position_entry["id"] in object_positions):
                    object_positions[position_entry["id"]] = []
                object_positions[position_entry["id"]].append(
                    {
                        "distance_from_camera_center": distance(device_data["DEVICE_CENTER_X"], device_data["DEVICE_CENTER_Y"], position_entry["image_x"], position_entry["image_y"]),
                        "x": position_entry["x"], 
                        "y": position_entry["y"], 
                        "orientation": position_entry["orientation"]
                    }
                )
        if use_vision_log and len(self.vision_log) > 0:
            for object_position_data in self.vision_log[-1]["POSITION_DATA"]:
                estimated_position = self.format_estimated_position(object_position_data["id"], object_position_data["x"], object_position_data["y"], object_position_data["orientation"], virtual_room_id=virtual_room_id, is_physical=True)
                estimated_positions.append(
                    estimated_position
                )
        else:
            for object_id, object_position_data in object_positions.items():
                estimated_x, estimated_y, estimated_orientation = self.get_estimated_position_data(object_position_data)
                estimated_position = self.format_estimated_position(object_id, estimated_x, estimated_y, estimated_orientation, virtual_room_id=virtual_room_id, is_physical=True)
                estimated_positions.append(
                    estimated_position
                )
        if virtual_room_id and virtual_room_id in self.virtual_objects:
            for virtual_object_id, virtual_object_data in self.virtual_objects[virtual_room_id].items():
                estimated_position = self.format_estimated_position(virtual_object_id, virtual_object_data["x"], virtual_object_data["y"], virtual_object_data["orientation"], virtual_object_data=virtual_object_data, virtual_room_id=virtual_room_id)
                
                estimated_positions.append(
                    estimated_position
                )
        return estimated_positions

    def format_estimated_position(self, object_id, estimated_x, estimated_y, estimated_orientation, virtual_object_data=None,virtual_room_id=None, is_physical=False):
        estimated_position = {
                "id": object_id, 
                "name": None,
                "type": None,
                "deltas_to_vertices": None,
                "length": None,
                "width": None, 
                "radius": None, 
                "radiusY": None, 
                "height": None, 
                "shape": None, 
                "color": None, 
                "x": estimated_x, 
                "y": estimated_y, 
                "orientation": estimated_orientation,
                "is_physical": is_physical
            }
        if virtual_object_data:
            for key in list(estimated_position.keys()):
                if estimated_position[key] == None:
                    estimated_position[key] = virtual_object_data[key] if key in virtual_object_data else None
        if virtual_room_id and virtual_room_id in self.vision_object_map:
            for key in list(estimated_position.keys()):
                if estimated_position[key] == None:
                    estimated_position[key] = self.vision_object_map[virtual_room_id][object_id][key] if object_id in self.vision_object_map[virtual_room_id] else None
        for key in list(estimated_position.keys()):
            if estimated_position[key] == None:
                estimated_position.pop(key, None) 
        return estimated_position

    def get_estimated_position_data(self, apriltag_position_data):
        """ Returns the estimated position of an apriltag detected by all cameras based on apriltage position data """
        x = 0
        y = 0
        orientation = 0
        weighted_divisor = 0
        for position_entry in apriltag_position_data:
            distance = round(position_entry["distance_from_camera_center"],3) if round(position_entry["distance_from_camera_center"],3) > 0 else .0001
            weight = 1/distance
            x += weight * position_entry["x"]
            y += weight * position_entry["y"]
            orientation += weight * position_entry["orientation"]
            weighted_divisor += weight
        x /= weighted_divisor
        y /= weighted_divisor
        orientation /= weighted_divisor
        return x, y, orientation

 

    def get_vision_log(self):
        """
        Returns entire vision log.
        """
        return self.vision_log

    def vision_monitior(self):
        """
        Removes stale data from vision snapshot
        Updates the vision log with current positions from vision snapshot. 
        Size of log based on MAX_VISION_LOG_LENGTH
        """
        while True:
            for device_id in list(self.vision_snapshot.keys()):
                if time.time() - self.vision_snapshot[device_id]["TIMESTAMP"] > VISION_DATA_HOLD_THRESHOLD:
                    self.vision_snapshot.pop(device_id, None)
            self.vision_log.append({"TIMESTAMP": time.time(), "POSITION_DATA": self.get_estimated_positions()})
            while len(self.vision_log) > MAX_VISION_LOG_LENGTH:
                self.vision_log.pop(0)
            time.sleep(1/VISION_UPDATE_FREQUENCY) 


    # ==================== BOTS ====================

    def get_bot(self, bot_name: str) -> Bot:
        """ Returns bot object corresponding to bot name """
        if bot_name in self.active_bots:
            return self.active_bots[bot_name]
        return None

    def get_bot_names(self):
        """ Returns a list of the Bot Names. """
        return list(self.active_bots.keys())

    def listen_for_minibot_broadcast(self):
        """ Listens for the Minibot to broadcast a message to figure out the 
        Minibot's ip address. Code taken from link below:
            https://github.com/jholtmann/ip_discovery
        """

        response = "i_am_the_base_station"
        # a minibot should send this message in order to receive the ip_address
        request_password = "i_am_a_minibot"

        buffer_size = 4096

        # Continuously read from the socket, collecting every single broadcast
        # message sent by every Minibot
        address_data_map = {}
        try:
            data, address = self.sock.recvfrom(buffer_size)
            while data:
                data = str(data.decode('UTF-8'))
                address_data_map[address] = data
                data, address = self.sock.recvfrom(buffer_size)
        # nothing to read
        except socket.timeout:
            pass

        # create a new Minibot object to represent each Minibot that sent a
        # broadcast to the basestation
        for address in address_data_map:
            # data should consist of "password port_number"
            data_lst = address_data_map[address].split(" ")

            if data_lst[0] == request_password:
                # Tell the minibot that you are the base station
                self.sock.sendto(response.encode(), address)
                self.add_bot(ip_address=address[0], port=data_lst[1])

    def add_bot(self, port: int, ip_address: str, bot_name: str = None):
        """ Adds a bot to the list of active bots """
        if not bot_name:
            # bot name is "minibot" + <last three digits of ip_address> + "_" +
            # <port number>
            bot_name = f"minibot{ip_address[-3:].replace('.', '')}_{port}"
        self.active_bots[bot_name] = Bot(bot_name, ip_address, port)

    def get_active_bots(self):
        """ Get the names of all the Minibots that are currently connected to 
        Basestation
        """
        for bot_name in self.get_bot_names():
            status = self.get_bot_status(bot_name)
            # if the bot is inactive, remove it from the active bots list
            if status == "INACTIVE":
                self.remove_bot(bot_name)
        return self.get_bot_names()

    def get_bot_status(self, bot_name: str) -> str:
        """ Gets whether the Minibot is currently connected or has been 
        disconnected.
        1. Send Minibot BOTSTATUS
        2. read from Minibot whatever Minibot has sent us.
        3. check when was the last time Minibot sent us "I'm alive"
        4. Return if Minibot is connected or not
        Arguments:
            bot_name: The name of the minibot
        """
        bot = self.get_bot(bot_name)
        # ask the bot to reply whether its ACTIVE
        bot.sendKV("BOTSTATUS", "")
        # read the newest message from the bot
        bot.readKV()
        if bot.is_connected():
            status = "ACTIVE"
        else:
            status = "INACTIVE"
        return status

    def remove_bot(self, bot_name: str):
        """Removes the specified bot from list of active bots."""
        self.active_bots.pop(bot_name)

    @make_thread_safe
    def move_bot_wheels(self, bot_name: str, direction: str, power: str):
        """ Gives wheels power based on user input """
        bot = self.get_bot(bot_name)
        direction = direction.lower()
        bot.sendKV("WHEELS", direction)

    def set_bot_mode(self, bot_name: str, mode: str):
        """ Set the bot to either line follow or object detection mode """
        bot = self.get_bot(bot_name)
        bot.sendKV("MODE", mode)

    def send_bot_script(self, bot_name: str, script: str):
        """Sends a python program to the specific bot"""
        bot = self.get_bot(bot_name)
        # reset the previous script_exec_result
        bot.script_exec_result = None
        parsed_program_string = self.parse_program(script)
        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)

    def get_virtual_program_execution_data(self, script: str) -> Dict[str, List[Dict]]:
        parsed_program_string = self.parse_program(script)
        return run_program_string_for_gui_data(parsed_program_string)

    def parse_program(self, script: str) -> str:
        # Regex is for bot-specific functions (move forward, stop, etc)
        # 1st group is the whitespace (useful for def, for, etc),
        # 2nd group is for func name, 3rd group is for args,
        # 4th group is for anything else (additional whitespace,
        # ":" for end of if condition, etc)
        pattern = r"(.*)bot.(\w*)\((.*)\)(.*)"
        regex = re.compile(pattern)
        program_lines = script.split('\n')
        parsed_program = []
        for line in program_lines:
            match = regex.match(line)
            if match:
                if match.group(2) in self.blockly_function_map:
                    func = self.blockly_function_map[match.group(2)]
                else:
                    func = match.group(2)
                args = match.group(3)
                whitespace = match.group(1)
                if not whitespace:
                    whitespace = ""
                parsed_line = whitespace
                if func in self.blockly_threaded_functions:
                    parsed_line += f"Thread(target={func}, args=[{args}]).start()\n"
                else:
                    parsed_line += f"{func}({args}){match.group(4)}\n"
                parsed_program.append(parsed_line)
            else:
                parsed_program.append(line + '\n')  # "normal" Python
        parsed_program_string = "".join(parsed_program)
        return parsed_program_string

    def set_bot_ports(self, bot_name: str, ports: str):
        """Sets motor port(s) of the specific bot"""
        bot = self.get_bot(bot_name)
        ports_str = " ".join([str(l) for l in ports])
        bot.sendKV("PORTS", ports_str)

    def get_bot_script_exec_result(self, bot_name: str) -> str:
        """ Retrieve the last script's execution result from the specified bot.
        """
        bot = self.get_bot(bot_name)
        # request the bot to send the script execution result
        bot.sendKV("SCRIPT_EXEC_RESULT", "")
        # try reading to see if the bot has replied
        bot.readKV()
        # this value might be None if the bot hasn't replied yet
        return bot.script_exec_result

    # ==================== DATABASE ====================
    def login(self, email: str, password: str) -> Tuple[int, Optional[str]]:
        """Logs in the user if the email and password are valid"""
        print("email:" + email)
        print("password" + password)
        if not email:
            return -1, None
        if not password:
            return 0, None

        user = User.query.filter(User.email == email).first()
        # email does not exist
        if not user:
            return -1, None
        if not user.verify_password(password):
            return 0, None
        self.login_email = email
        return 1, user.custom_function

    def register(self, email: str, password: str) -> int:
        """Registers a new user if the email and password are not null and 
        there is no account associated wth the email yet"""
        if not email:
            return -1
        if not password:
            return 0

        user = User.query.filter(User.email == email).first()
        # user should not exist if we want to register a new account
        if user:
            return -2
        user = User(email=email, password=password)
        db.session.add(user)
        db.session.commit()
        return 1

    def update_custom_function(self, custom_function: str) -> bool:
        """Adds custom function(s) for the logged in user if there is a user 
        logged in
        """
        if not self.login_email:
            return False

        user = User.query.filter(User.email == self.login_email).first()
        user.custom_function = custom_function
        db.session.commit()
        return True

    # ==================== SPEECH RECOGNITION ====================
    def get_speech_recognition_status(self) -> str:
        """Retrieves the speech recognition status string"""
        message = (
            self.speech_recog_thread.message_queue.pop()
            if self.speech_recog_thread else ""
        )
        # could be None because message_queue.pop() can return None
        message = "" if message is None else message
        return message

    def toggle_speech_recognition(self, bot_name: str, command: str) -> None:
        """Toggles the speech recognition between states of running and stopped"""
        if command == "START":
            # create a new thread that listens and converts speech
            # to text in the background.  Cannot run this non-terminating
            # function  in the current thread because the current post request
            # will not terminate and our server will not handle any more
            # requests.
            self.speech_recog_thread = StoppableThread(
                self.speech_recognition, bot_name
            )
            self.speech_recog_thread.start()
        # stop listening
        elif command == "STOP":
            if self.speech_recog_thread:
                self.speech_recog_thread.stop()

    def speech_recognition(
        self,
        thread_safe_condition: ThreadSafeVariable,
        thread_safe_message_queue: ThreadSafeVariable,
        bot_name: str
    ) -> None:
        """ Listens to the user and converts the user's speech to text. 
        Arguments:
            thread_safe_condition: This variable is used by the parent function 
                to stop this speech recognition thread.  As long as this variable
                is True, the speech recognition service runs.  When it becomes 
                False, the service exits its loop.
            thread_safe_message_queue:  The queue of messages to be displayed 
                on the GUI. Needs to be thread safe because messages are pushed 
                on to the queue by this thread, and the parent function / thread
                pops messages from this queue. The parent function relays these 
                messages to the front-end as the response of a post request.
            session_id:  Unique identifier for the user's current session.
            bot_id:  Unique identifier for the Minibot we are connected to 
                currently.
        """
        RECORDING_TIME_LIMIT = 5
        # dictionary of commmands
        commands = {
            "forward": "Minibot moves forward",
            "backward": "Minibot moves backwards",
            "left": "Minibot moves left",
            "right": "Minibot moves right",
            "stop": "Minibot stops",
        }
        # open the Microphone as variable microphone
        with sr.Microphone() as microphone:
            recognizer = sr.Recognizer()
            while thread_safe_condition.get_val():
                thread_safe_message_queue.push("Say something!")
                try:
                    recognizer.adjust_for_ambient_noise(microphone)
                    # listen for 5 seconds
                    audio = recognizer.listen(microphone, RECORDING_TIME_LIMIT)
                    thread_safe_message_queue.push(
                        "Converting from speech to text")

                    # convert speech to text
                    words = recognizer.recognize_google(audio)

                    # remove non-alphanumeric characters
                    regex = re.compile('[^a-zA-Z]')  # removing punctuation
                    regex.sub('', words)
                    thread_safe_message_queue.push(f"You said: {words}")

                    # check if the command is valid
                    if words in commands:
                        thread_safe_message_queue.push(commands[words])
                        self.move_bot_wheels(bot_name, words, 100)
                    else:
                        thread_safe_message_queue.push("Invalid command!")
                except sr.WaitTimeoutError:
                    thread_safe_message_queue.push("Timed out!")
                except sr.UnknownValueError:
                    thread_safe_message_queue.push("Words not recognized!")

    # ==================== GETTERS and SETTERS ====================
    @property
    def login_email(self) -> str:
        """Retrieves the login email property"""
        return self._login_email

    @login_email.setter
    def login_email(self, email: str):
        """Sets the login email property"""
        self._login_email = email

    # data analytics

    def get_user(self, email: str) -> User:
        user = User.query.filter_by(email=email).first()
        return user

    def save_submission(self, code: str, email: str) -> Submission:
        submission = Submission(
            code=code,
            time=time.strftime("%Y/%b/%d %H:%M:%S", time.localtime()),
            duration=-1,
            user_id=self.get_user(email).id
        )
        db.session.add(submission)
        db.session.commit()
        return submission

    def update_result(self, result: str, submission_id: int):
        if submission_id is None:
            return
        submission = Submission.query.filter_by(id=submission_id).first()
        submission.result = result
        db.session.commit()

    def get_all_submissions(self, user: User) -> []:
        submissions = []
        submissions = Submission.query.filter_by(user_id=User.id)
        return submissions

    
