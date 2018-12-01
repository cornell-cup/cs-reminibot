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
            ("/" + self.base_station_key, BaseStationHandler, dict(base_station=self.base_station)),
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
        self.render("../static/basestation_gui/index.html", title = "Base Station")

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
            new_id = self.base_station.add_session();
            self.set_secure_cookie("user_id", new_id)
        
        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8") 
        self.render("../static/gui/index.html", title = "Client")

    def post(self):
        data = json.loads(self.request.body.decode())
        key = data['key']

        session_id = self.get_secure_cookie("user_id")
        if session_id:
            session_id = session_id.decode("utf-8")

        if key == "CONNECTBOT":
            bot_name = data['bot_name']
            print("bot " + str(bot_name))
            print("session " + str(session_id))
            self.write(json.dumps(self.base_station.add_bot_to_session(session_id, bot_name)).encode())
        elif key == "WHEELS":
            bot_name = data['bot_name']
            direction = data['direction']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.move_wheels_bot(session_id, bot_id, direction, power)
        elif key == "WINGS":
            bot_name = data['bot_name']
            power = str(data['power'])
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            bot = self.base_station.get_bot(bot_id)
            bot.sendKV("WINGS", str(power))
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
            self.write(json.dumps(self.base_station.get_active_bots_names()).encode())
        elif key == "SCRIPTS":
            value = data['value']
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name);
            bot = self.base_station.get_bot(bot_id)
            if bot:
                if len(value) == 0:
                    print("GETTING SCRIPTS")
                    bot.sendKV("SCRIPTS", '')
                elif len(value) == 1:
                    print("SENDING SCRIPTS")
                    bot.sendKV("SCRIPTS", value[0])
                elif len(value) == 2:
                    print("SAVING SCRIPTS")
                    bot.sendKV("SCRIPTS", ",".join(value))
        elif key == "DISCONNECTBOT":
            bot_name = data['bot']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.remove_bot_from_session(session_id, bot_id)
        elif key == "BOTSTATUS":
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name);
            bot = self.base_station.get_bot(bot_id)
            if bot:
                bot.sendKV("BOTSTATUS", '')
                self.write(json.dumps(bot.tcp_listener_thread.status).encode())


class VisionHandler(tornado.websocket.WebSocketHandler):
    #this is NOT an example implementation of websockets in Tornado

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