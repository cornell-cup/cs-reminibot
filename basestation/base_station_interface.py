"""
Main file from which BaseStation Websocket interface begins.
"""

from base_station import BaseStation
from util.stoppable_thread import StoppableThread, ThreadSafeVariable
import speech_recognition as sr
import pyaudio
import threading
import tornado
import tornado.web
import tornado.websocket
import os.path
import json
import logging
import sys
import time
import re  # regex import
import requests

# Minibot imports.


class BaseInterface:
    """
    Class which contains the base station and necessary functions for running the
    base station GUI.
    """

    def __init__(self, port, send_blockly_remote_server=True):
        """
        Initializes base station
        :param port: Port number from which basestation runs (usually 8080)
        """
        self.base_station = BaseStation()
        self.port = port

        self.base_station_key = self.base_station.get_base_station_key()
        """prints key to console"""
        print(self.base_station_key)

        self.settings = {
            "static_path": os.path.join(os.path.dirname(__file__), "../static"),
            "cookie_secret": str(self.base_station.add_session())
        }

        # Setting up handlers.
        # /start  -> localhost:8080/start
        # /vision -> localhost:8080/vision
        # To add more handlers, pair the route ("/<whatever>" to a Route Handler
        # eg. ClientHandler)
        self.handlers = [
            ("/start", ClientHandler, dict(
                base_station=self.base_station,
                send_blockly_remote_server=send_blockly_remote_server,
            )),
            ("/vision", VisionHandler, dict(base_station=self.base_station)),
            ("/heartbeat", HeartbeatHandler, dict(base_station=self.base_station)),
            ("/result", ErrorMessageHandler, dict(base_station=self.base_station)),
            ("/speech_recognition", SpeechRecognitionHandler,
             dict(base_station=self.base_station)),
        ]

    def start(self):
        """
        Starts server for application.
        """
        app = self.make_app()
        app.listen(self.port)
        tornado.ioloop.IOLoop.current().start()

    def make_app(self):
        """
        Creates the application object (via Tornado).
        """
        return tornado.web.Application(self.handlers, **self.settings)


class ClientHandler(tornado.web.RequestHandler):
    """
    Displays the Client GUI.
    Handler for /start
    """

    def initialize(self, base_station, send_blockly_remote_server):
        self.base_station = base_station
        self.send_blockly_remote_server = send_blockly_remote_server

    def get(self):
        if not self.get_secure_cookie("user_id"):
            new_id = self.base_station.add_session()
            self.set_secure_cookie("user_id", new_id)

        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")
        self.render("../static/gui/index.html", title="Client")

    def post(self):
        data = json.loads(self.request.body.decode())
        key = data['key']

        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")

        if key == "CONNECTBOT":
            bot_name = data['bot_name']
            if bot_name != None and bot_name != "":
                print("Connecting bot " + str(bot_name))
                print("session " + str(session_id))
                self.write(json.dumps(self.base_station.add_bot_to_session(
                    session_id, bot_name)).encode())
            else:
                print("No bot received, or bot name empty.")
        if key == "MODE":
            bot_name = data['bot_name']
            mode_type = data['value']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV(key, str(mode_type))
        elif key == "WHEELS":
            bot_name = data['bot_name']
            direction = data['direction']
            power = str(data['power'])

            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.move_wheels_bot(
                session_id, bot_id, direction, power)
        elif key == "PORTS":
            # leftmotor = data['leftmotor']
            bot_id = self.base_station.bot_name_to_bot_id(data['bot_name'])

            portarray = data['ports']
            for x in portarray:
                print(x)
            self.base_station.set_ports(portarray, session_id, bot_id)

        # Looks for bots on the local network to connect to.
        elif key == "DISCOVERBOTS":
            self.write(json.dumps(
                self.base_station.get_active_bots_names()).encode())
        # Receives the Blockly Generated Python scripts sent from the GUI.
        elif key == "SCRIPTS":
            print('data is:')
            print(data)
            value = data['value']
            bot_name = data['bot_name']
            params = {'bot_name': bot_name, 'value': value}

            if self.send_blockly_remote_server:
                url = 'http://127.0.0.1:5000/code/'
                x = requests.post(url, json=params)
                url2 = 'http://127.0.0.1:5000/program/'
                x = requests.get(url2)

            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            # reset the previous script's error message, so we can get the new error message
            # of the new script
            bot.set_error_message(None)
            if bot:
                print("Code len = " + str(len(value)))
                print(type(bot))
                if len(value) == 0:
                    print("GETTING SCRIPTS")
                    bot.sendKV("SCRIPTS", "")
                elif len(value) == 1:
                    print("SENDING SCRIPTS")
                    bot.sendKV("SCRIPTS", value[0])
                elif len(value) == 2:
                    print("SAVING SCRIPTS")
                    bot.sendKV("SCRIPTS", ",".join(value))
                else:
                    # TODO check if a "long enough" program
                    # is supposed to be sent over
                    print("RUNNING SCRIPT")
                    self.send_program(bot, value)

        elif key == "DISCONNECTBOT":
            bot_name = data['bot']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.remove_bot_from_session(session_id, bot_id)
        elif key == "BOTSTATUS":
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            if bot:
                bot.sendKV("BOTSTATUS", '')
                self.write(json.dumps(bot.tcp_listener_thread.status).encode())

    def send_program(self, bot, program):
        """
        Sends the program received from Blockly to the bot, translated
        into ECE-supplied functions.

        Args:
            bot: the pi_bot to send to
            program: the string containing the python code generated
        """
        # function_map : Blockly functions -> ECE functions
        function_map = {
            "move_forward": "fwd",
            "move_backward": "back",
            "wait": "time.sleep",
            "stop": "stop",
            "set_wheel_power": "ECE_wheel_pwr",
            "turn_clockwise": "right",
            "turn_counter_clockwise": "left",
            "read_ultrasonic": "read_ultrasonic",
            "move_servo": "move_servo",
        }

        # functions that run continuously, and hence need to be started
        # in a new thread on the Minibot otherwise the Minibot will get
        # stuck in an infinite loop and will be unable to receive
        # other commands
        threaded_functions = [
            "fwd",
            "back",
            "stop",
            "ECE_wheel_pwr",
            "right",
            "left",
        ]

        # Regex is for bot-specific functions (move forward, stop, etc)
        # 1st group is the whitespace (useful for def, for, etc),
        # 2nd group is for func name, 3rd group is for args,
        # 4th group is for anything else (additional whitespace,
        # ":" for end of if condition, etc)
        pattern = r"(.*)bot.(\w*)\((.*)\)(.*)"
        regex = re.compile(pattern)
        program_lines = program.split('\n')
        parsed_program = []
        for line in program_lines:
            match = regex.match(line)
            if not match:
                parsed_program.append(line + '\n')  # "normal" Python
            else:
                func = function_map[match.group(2)]
                args = match.group(3)
                whitespace = match.group(1)
                if not whitespace:
                    whitespace = ""
                parsed_line = whitespace
                if func in threaded_functions:
                    parsed_line += "Thread(target={}, args=[{}]).start()\n".format(
                        func, args)
                else:
                    parsed_line += func + \
                        "(" + args + ")" + match.group(4) + "\n"
                parsed_program.append(parsed_line)

        parsed_program_string = "".join(parsed_program)

        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)


class VisionHandler(tornado.websocket.WebSocketHandler):
    """ Class that handles requests to /vision """

    def initialize(self, base_station):
        self.base_station = base_station

    def get(self):
        self.write(json.dumps(self.base_station.get_vision_data()).encode())

    def post(self):
        info = json.loads(self.request.body.decode())
        self.base_station.update_vision_log(info)


class HeartbeatHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, base_station):
        self.base_station = base_station

    def get(self):
        time_interval = 1
        is_heartbeat = self.base_station.is_heartbeat_recent(time_interval)
        heartbeat_json = {"is_heartbeat": is_heartbeat}
        self.write(json.dumps(heartbeat_json).encode())


class SpeechRecognitionHandler(tornado.websocket.WebSocketHandler):
    """ Handles start speech recognition and stop speech recognition
    requests from the WebGUI. """

    def initialize(self, base_station):
        self.base_station = base_station

    def get(self):
        """ Gets the current status from the Speech Recognition system,
        to be displayed on the WebGUI.
        """
        speech_recog_thread = self.base_station.speech_recog_thread
        message = (
            speech_recog_thread.message_queue.pop()
            if speech_recog_thread else None
        )
        # could be None because get_val can return None too
        if message is None:
            message = ""
        self.write(message)

    def post(self):
        """ Starts and stops the speech recognition thread depending on the
        command sent in the request
        """
        data = json.loads(self.request.body.decode())
        # The command is either START or STOP
        command = data["command"]
        bot_name = data["bot_name"]
        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")

        # start listening and converting speech to text
        if command == "START":
            # create a new thread that listens and converts speech
            # to text in the background.  Cannot run this non-terminating
            # function  in the current thread because the current post request
            # will not terminate and our server will not handle any more
            # requests.
            if not self.base_station.speech_recog_thread:
                self.base_station.speech_recog_thread = StoppableThread(
                    self.speech_recognition, session_id, bot_id
                )
            self.base_station.speech_recog_thread.start()
        # stop listening
        elif command == "STOP":
            if self.base_station.speech_recog_thread:
                self.base_station.speech_recog_thread.stop()

    def speech_recognition(
        self,
        thread_safe_condition: ThreadSafeVariable,
        thread_safe_message_queue: ThreadSafeVariable,
        session_id: int,
        bot_id: int
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
                        self.base_station.move_wheels_bot(
                            session_id, bot_id, words, 100
                        )
                    else:
                        thread_safe_message_queue.push("Invalid command!")
                except sr.WaitTimeoutError:
                    thread_safe_message_queue.push("Timed out!")
                except sr.UnknownValueError:
                    thread_safe_message_queue.push("Words not recognized!")


class ErrorMessageHandler(tornado.websocket.WebSocketHandler):
    """
    Class for handling Python error messages.
    """

    def initialize(self, base_station):
        self.base_station = base_station

    def post(self):
        """
        Called by blockly.js to send Python error message back to the GUI.
        For each Python program entered, blockly.js will repeatedly call
        this function until error_json has code != -1.
        """
        data = json.loads(self.request.body.decode())
        bot_name = data['bot_name']
        error_message = self.base_station.get_error_message(bot_name)
        if not error_message:
            error_json = {"error": "", "code": -1}
        elif error_message == "Successful execution":
            error_json = {"error": error_message, "code": 1}
        else:
            error_json = {"error": error_message, "code": 0}
        # Send back to GUI
        self.write(json.dumps(error_json).encode())


if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    base_station_server = BaseInterface(8080, send_blockly_remote_server=True)
    base_station_server.start()
