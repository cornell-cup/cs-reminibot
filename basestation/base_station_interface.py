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

# Minibot imports.
from base_station import BaseStation


class BaseInterface:
    """
    Class which contains the base station and necessary functions for running the
    base station GUI.
    """

    def __init__(self, port):
        """
        Initializes base station
        :param port: Port number from which basestation runs.
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
        self.handlers = [
            ("/" + self.base_station_key, BaseStationHandler,
             dict(base_station=self.base_station)),
            ("/start", ClientHandler, dict(base_station=self.base_station)),
            ("/vision", VisionHandler, dict(base_station=self.base_station))
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


class BaseStationHandler(tornado.web.RequestHandler):
    """
    Displays the Base Station GUI.
    """

    def initialize(self, base_station):
        self.base_station = base_station

    def get(self):
        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")
        self.render("../static/basestation_gui/index.html",
                    title="Base Station")

    def post(self):
        data = json.loads(self.request.body.decode())
        key = data['key']

        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")

        if key == "DISPLAYDATA":
            self.write(json.dumps(self.base_station.get_bots_info()))


class ClientHandler(tornado.web.RequestHandler):
    """
    Displays the Client GUI.
    """

    def initialize(self, base_station):
        self.base_station = base_station

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
            bot.sendKV(key, mode_type)
        elif key == "WHEELS":
            bot_name = data['bot_name']
            direction = data['direction']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.move_wheels_bot(
                session_id, bot_id, direction, power)
        elif key == "WINGS":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("WINGS", str(power))
        elif key == "DWHEELS":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("DWHEELS", str(power))
        elif key == "BODY":
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("BODY", "0")
        elif key == "HEAD":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("HEAD", str(power))
        elif key == "GUN":
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            print("HERE IN LASER TAG")
            bot.sendKV("GUN", "0")
        elif key == "AIM":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("AIM", str(power))
            print("HERE IN LASER TAG AIM")
        # elif key == "TAIL":
        #     # TODO finish this
        #     bot_name = data['bot_name']
        #     power = str(data['power'])
        #     bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        #     self.base_station.move_wings_bot(session_id, bot_id, power)
        # elif key == "JAW":
        #     # TODO finish this
        #     bot_name = data['bot_name']
        #     direction = data['direction']
        #     power = str(data['power'])
        #     bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        #     self.base_station.move_jaw_bot(session_id, bot_id, direction, power)
        # elif key == "BODY":
        #     # TODO finish this
        #     bot_name = data['bot_name']
        #     direction = data['direction']
        #     power = str(data['power'])
        #     bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        #     self.base_station.move_body_bot(session_id, bot_id, direction, power)
        elif key == "DISCOVERBOTS":
            print("discover_bots")
            self.write(json.dumps(
                self.base_station.get_active_bots_names()).encode())
        elif key == "SCRIPTS":
            value = data['value']
            print(value)
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
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
                    print(value)
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
        elif key == "BWHEELS":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("BWHEELS", str(power))
        elif key == "ARM":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("ARM", str(power))

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
            "turn_clockwise": "ECE_turn_CW",
            "turn_counter_clockwise": "ECE_turn_CCW"
        }

        # Regex is for bot-specific functions (move forward, stop, etc)
        # 1st group is the whitespace (useful for def, for, etc),
        # 2nd group is for func name, 3rd group is for args.
        pattern = "(\s*)bot.(\w*)\((.*)\)"
        regex = re.compile(pattern)

        # TODO what to do after a function bound to a wait is done?
        # Do we do whatever we did before? Do we stop?

        program_lines = program.split('\n')
        parsed_program = []
        for line in program_lines:
            match = regex.match(line)
            if match == None:
                parsed_program.append(line + '\n')  # "normal" python
            else:
                func = function_map[match.group(2)]
                args = match.group(3)
                whitespace = match.group(1)
                if whitespace == None:
                    whitespace = ""
                parsed_program.append(whitespace + func + "(" + args + ")\n")

        parsed_program_string = "".join(parsed_program)
        print(parsed_program_string)

        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)


class VisionHandler(tornado.websocket.WebSocketHandler):
    # this is NOT an example implementation of websockets in Tornado

    def initialize(self, base_station):
        self.base_station = base_station

    def get(self):
        self.write(json.dumps(self.base_station.get_vision_data()).encode())

    def post(self):
        info = json.loads(self.request.body.decode())
        self.base_station.update_vision_log(info)
        # tag_id = self.locations['id']
        # x, y, z = self.locations['x'], self.locations['y'], self.locations['z']
        # logging.info("Received vision data " + str((tag_id, x, y, z)))


if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    base_station = BaseInterface(8080)
    base_station.start()
