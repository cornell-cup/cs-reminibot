"""
Base Station Bot.
"""
from connection.tcp_connection import TCPConnection

class BaseStationBot:
    def __init__(self, bot_id, ip, port=10000):
        self.id = bot_id
        self.port = port
        self.ip = ip

        self.tcp_connection = TCPConnection(ip, port=port)

    def __del__(self):
        pass

    def get_id(self):
        return self.id

    def get_ip(self):
        return self.ip

    def is_active(self):
        return self.tcp_connection.is_connection_active()
