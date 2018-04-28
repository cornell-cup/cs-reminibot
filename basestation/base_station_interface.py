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
        self.settings = {
            "static_path": os.path.join(os.path.dirname(__file__), "../static"),
            "cookie_secret": str(self.base_station.add_session())
        }
        self.handlers = [
            ("/", BaseStationHandler, dict(base_station=self.base_station)),
            ("/start", ClientHandler, dict(base_station=self.base_station))
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
        self.write("Welcome to Base Station " + str(session_id))

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
        self.render("../static/gui/index.html", title = "Title")

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
            self.base_station.add_bot_to_session(session_id, bot_name)
        elif key == "WHEELS":
            bot_name = data['bot_name']
            direction = data['direction']
            power = str(data['power'])

            bot_id = self.base_station.bot_name_to_bot_id(bot_name)
            self.base_station.move_wheels_bot(session_id, bot_id, direction, power)
        elif key == "DISCOVERBOTS":
            self.write(json.dumps(self.base_station.get_active_bots_names()).encode())
        elif key == "SCRIPTS":
            value = data['value']
            bot_name = data['bot_name']
            bot_id = self.base_station.bot_name_to_bot_id(bot_name);
            bot = self.base_station.get_bot(bot_id)

            if len(value) == 0:
                print("GETTING SCRIPTS")
                bot.sendKV("SCRIPTS", '')
            elif len(value) == 1:
                print("SENDING SCRIPTS")
                bot.sendKV("SCRIPTS", value[0])
            elif len(value) == 2:
                print("SAVING SCRIPTS")
                bot.sendKV("SCRIPTS", ",".join(value))



            


if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    base_station = BaseInterface(8080)
    base_station.start()