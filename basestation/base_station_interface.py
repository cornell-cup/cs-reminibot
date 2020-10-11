"""
Main file from which BaseStation Websocket interface begins.
"""

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
import threading
import pyaudio
import speech_recognition as sr
from util.stoppable_thread import StoppableThread

# Minibot imports.
from base_station import BaseStation
# from piVision import *
# from piVision.server import startBotVisionServer


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
            ("/voice", SpeechRecognitionHandler,
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
            print("Reached MODE")
            bot_name = data['bot_name']
            mode_type = data['value']
            print("here!")
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
                print("Post")
                print(x.json)

                print('database test')
                url2 = 'http://127.0.0.1:5000/program/'
                x = requests.get(url2)
                print("Get")
                print(x.json)

            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            # reset the previous script's error message, so we can get the new error message
            # of the new script
            bot.set_result(None)
            if bot:
                print("Code len = " + str(len(value)))
                print(type(bot))
                if len(value) == 0:
                    print("GETTING SCRIPTS")
                    bot.sendKV("SCRIPTS", '')
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
            bot: The pi_bot to send to
            program: The string containing the python code generated
            from blockly

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
                parsed_program.append(line + '\n')  # "normal" python
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
        print(parsed_program_string)

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
        voice_server = self.base_station.voice_server
        message = voice_server.message.get_val() if voice_server else None
        # could be None because get_val can return None too
        if message is None:
            message = ""
        self.write(message)

    def post(self):
        """ 
        """
        data = json.loads(self.request.body.decode())
        key = data['key']

        bot_name = data['bot_name']
        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        bot = self.base_station.get_bot(bot_id)
        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")

        if not bot:
            return

        if key == "START VOICE":  # start listening
            self.base_station.voice_server = StoppableThread(
                self.voice_recognition, session_id, bot_id
            )
            self.base_station.voice_server.start()
        elif key == "STOP VOICE":
            if self.base_station.voice_server:
                self.base_station.voice_server.stop()

    def voice_recognition(self, thread_safe_condition, thread_safe_message, session_id, bot_id):
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
            r = sr.Recognizer()
            while thread_safe_condition.get_val():
                thread_safe_message.set_val("Say something!")
                try:
                    # listen for 5 seconds
                    audio = r.listen(microphone, RECORDING_TIME_LIMIT)
                    thread_safe_message.set_val(
                        "Converting from speech to text")
                    words = r.recognize_google(audio)
                    regex = re.compile('[^a-zA-Z]')  # removing punctuation
                    regex.sub('', words)
                    thread_safe_message.set_val("You said: " + words)
                    thread_safe_message.set_val(words)
                    if words in commands:
                        thread_safe_message.set_val(commands[words])
                        self.base_station.move_wheels_bot(
                            session_id, bot_id, words, 100)
                    else:
                        thread_safe_message.set_val("Invalid command")
                except sr.WaitTimeoutError:
                    thread_safe_message.set_val("timed out")
                except sr.UnknownValueError:
                    thread_safe_message.set_val("words not recognized")
                time.sleep(2)


class ErrorMessageHandler(tornado.websocket.WebSocketHandler):
    def initialize(self, base_station):
        self.base_station = base_station

    def post(self):
        data = json.loads(self.request.body.decode())
        bot_name = data['bot_name']
        error_message = self.base_station.get_error_message(bot_name)
        while not error_message:
            error_message = self.base_station.get_error_message(bot_name)
        if error_message == "Successful execution":
            error_json = {"error": error_message, "code": 1}
        else:
            error_json = {"error": error_message, "code": 0}
        print("error_json is: ")
        print(error_json)
        self.write(json.dumps(error_json).encode())


if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    base_station_server = BaseInterface(8080, send_blockly_remote_server=True)
    base_station_server.start()
