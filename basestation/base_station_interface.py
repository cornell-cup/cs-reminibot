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
            ("/start", ClientHandler, dict(base_station=self.base_station)),
            ("/vision", VisionHandler, dict(base_station=self.base_station))
        ]
        self.locations = {}

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
        self.render("../static/gui/index.html", title = "Title")

class VisionHandler(tornado.websocket.WebSocketHandler):
    #this is an example implementation of websockets in Tornado

    def get(self):
        botlist = []
        for k in self.locations:
            v = self.locations[k]
            botlist.append({'id': k, 'x': v['x'], 'y': v['y'], 'size': v['size'], 'angle': v['angle'], 'type': v['type']})
        self.write(json.dumps(botlist).encode())

    def post(self):
        info = json.loads(self.request.body.decode())
        print("Received vision info: ", info)
        tag_id = info['id']
        x, y, z = info['x'], info['y'], info['z']
        logging.info("Received vision data " + str((tag_id, x, y, z)))

    def check_origin(self, origin):
        return True

    def open(self):
        print("WebSocket opened")

    def on_message(self, message):
        print(u"You said: " + message)
        self.write_message("message received")

    def on_close(self):
        print("WebSocket closed")

if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    base_station = BaseInterface(8080)
    base_station.start()