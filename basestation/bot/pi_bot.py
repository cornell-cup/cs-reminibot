"""
Base Station Bot.
"""

from connection.tcp_connection import TCPConnection
import threading
from util.exception_handling import *
from bot.base_station_bot import BaseStationBot


class PiBot(BaseStationBot, object):
    def __init__(self, bot_id, bot_name, isPrivate, ip, port=10000):
        super(PiBot, self).__init__(bot_id, bot_name, isPrivate)
        self.port = port
        self.ip = ip
        self.tcp_connection = TCPConnection(ip, port=port)
        self.tcp_listener_thread = self.TCPListener(self, self.tcp_connection)
        self.tcp_listener_thread.start()

        self.scripts = []
        self.error_message = None
        return

    def get_ip(self):
        """
        return ip address of bot
        """
        return self.ip

    def get_port(self):
        """
        return port value of bot
        """
        return self.port

    def get_error_message(self):
        return self.error_message

    def set_error_message(self, error_message):
        self.error_message = error_message

    def is_active(self):
        """
        check if tcp connection is alive
        """
        return self.tcp_connection.is_connection_active()


    def sendKV(self, key, value):
        """
        Send command from a bot with specified key and value.

        Args:
            key (str): Identifier of the command
            value (str): Value of the command
        """
        return self.tcp_connection.sendKV(key, value)


    class TCPListener(threading.Thread):
        """
        This class listens to data sent from TCP.py.
        """
        def __init__(self, outerClass, t):
            super().__init__()
            self.outerClass = outerClass
            self.tcp_connection = t
            self.status = ""

        def run(self):
            """
            Wait for incoming data as long as tcp connection is alive.
            """
            try:
                while True:
                    if self.tcp_connection.is_connection_active():
                        msg = self.tcp_connection.receive()
                        if msg is not None:
                            self.tcp_parse_incoming(msg)
            except RuntimeError as e:
                msg = "TCP receive failed"
                log_exn_info(e, msg=msg)

        def tcp_parse_incoming(self, data):
            """
            Parse incoming data.
            """
            start = data.find("<<<<")
            end = data.find(">>>>")
            comma = data.find(",")
            if start != -1 and comma != -1 and end != -1:
                key = data[start + 4: comma]
                value = data[comma+1: end]
                self.tcp_act_on_incoming(key, value)
            return True

        def tcp_act_on_incoming(self, key, value):
            """
            Set field values according to key.

            Args:
                key (str): Identifier of the command
                value (str): Value of the command
            """
            if key == "SCRIPTS":
                values = value.split(",")
                self.scripts = values
            elif key == "BOTSTATUS":
                self.status = value
            elif key == "ERRORMESSAGE":
                self.outerClass.set_error_message(value)
