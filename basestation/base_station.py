"""
Base Station for the MiniBot.
"""

from basestation.bot import Bot
from basestation.user_database import Program, User
from basestation import db
from basestation.util.stoppable_thread import StoppableThread, ThreadSafeVariable

from random import choice
from string import digits, ascii_lowercase, ascii_uppercase
from typing import Tuple, Optional
import os
import re
import socket
import sys
import time
import threading
import pyaudio
import speech_recognition as sr

MAX_VISION_LOG_LENGTH = 1000


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

        self.blockly_function_map = {
            "move_forward": "fwd",         "move_backward": "back",
            "wait": "time.sleep",          "stop": "stop",
            "set_wheel_power":             "ECE_wheel_pwr",
            "turn_clockwise": "right",     "turn_counter_clockwise": "left",
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
        server_address = ("0.0.0.0", 9434)

        # only bind in debug mode if you are the debug server, if you are the
        # monitoring program which restarts the debug server, do not bind,
        # otherwise the debug server won't be able to bind
        if app_debug and os.environ["WERKZEUG_RUN_MAIN"] == "true":
            self.sock.bind(server_address)
        else:
            self.sock.bind(server_address)

        self._login_email = None
        self.speech_recog_thread = None
        self.lock = threading.Lock()

    # ==================== VISION ====================

    def update_vision_log(self, value):
        """ Updates vision log. Size of log based on MAX_VISION_LOG_LENGTH """
        locations = {'id': value['id'], 'x': value['x'],
                     'y': value['y'], 'orientation': value['orientation']}
        self.vision_log.append(locations)
        if len(self.vision_log) > MAX_VISION_LOG_LENGTH:
            self.vision_log.pop(0)

    def get_vision_data(self):
        """ Returns most recent vision data """
        return self.vision_log[-1] if self.vision_log else None

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
        bot.sendKV("BOTSTATUS", "ACTIVE")
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
                func = self.blockly_function_map[match.group(2)]
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

        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)

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
        """Adds custom function(s) for the logged in user if there is a user logged in"""
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
