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

# Minibot imports.
from base_station import BaseStation


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

        self.settings = {
            "static_path": os.path.join(os.path.dirname(__file__), "../static"),
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
            ("/result", ErrorMessageHandler, dict(base_station=self.base_station))
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
        return tornado.web.Application(self.handlers, **self.settings, debug=True)


class ClientHandler(tornado.web.RequestHandler):
    """
    Displays the Client GUI.
    Handler for /start
    """

    def initialize(self, base_station, send_blockly_remote_server):
        self.base_station = base_station
        self.send_blockly_remote_server = send_blockly_remote_server

    def get(self):
        self.render("../static/gui/index.html", title="Client")

    def post(self):
        data = json.loads(self.request.body.decode())
        key = data['key']

        if key == "MODE":
            print("Reached MODE")
            bot_name = data['bot_name']
            mode_type = data['value']
            print("here!")
            bot = self.base_station.get_bot(bot_name)
            bot.sendKV(key, str(mode_type))
        elif key == "WHEELS":
            bot_name = data['bot_name']
            direction = data['direction']
            power = str(data['power'])

            self.base_station.move_wheels_bot(bot_name, direction, power)
        elif key == "PORTS":
            # leftmotor = data['leftmotor']
            bot_name = data['bot_name']
            portarray = data['ports']
            for x in portarray:
                print(x)
            self.base_station.set_ports(portarray, bot_name)

        # Looks for bots on the local network to connect to.
        elif key == "DISCOVERBOTS":
            # go through each bot and make sure its active
            for bot_name in self.base_station.get_active_bots_names():
                bot = self.base_station.get_bot(bot_name)
                if not bot:
                    continue
                status = self.base_station.get_bot_status(bot)
                # if the bot is inactive, remove it from the active bots list
                if status == "INACTIVE":
                    self.base_station.remove_bot(bot_name)

            # return all the bots that are active after removing the inactive ones
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

            bot = self.base_station.get_bot(bot_name)
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
