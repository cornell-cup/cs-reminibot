"""
Main file from which client GUI HTTP interface begins.
"""

import tornado
import tornado.web
import os.path
import json
import logging
import sys

class ClientInterface:
    """
    Class which contains the client GUI and necessary functions for running the
    client GUI.
    """
    def __init__(self, port):
        """
        Initializes client GUI
        :param port: Port number from which client GUI runs.
        """
        self.port = port
        self.handlers = [
            ("/", ClientHandler),
        ]
        self.settings = {
            "static_path": os.path.join(os.path.dirname(__file__), "static")
        }
        
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
    Displays the GUI front-end.
    """
    def get(self):
        # self.write("Hi There")
        self.render("../gui/index.html", title="Title", items=[])


if __name__ == "__main__":
    """
    Main method for running client GUI.
    """
    client = ClientInterface(8080)
    client.start()