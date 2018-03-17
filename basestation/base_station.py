"""
Base Station for the MiniBot.
"""

# external
import tornado
import os

# internal
from basestation.connection.base_connection import BaseConnection
from basestation.bot.base_station_bot import BaseStationBot as BSBot

class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.port = None
        self.connections = BaseConnection()

    # ============ RUNNING BASESTATION ============

    def run(self, port):
        self.port = port
        print("Running Basestation...")

    # ==================== BOTS ====================

    def list_active_bots_names(self):
        """
        Returns a list of the Bot IDs.

        Returns:
            (list<str>): List of IDs of all active bots.
        """
        return list(self.active_bots.keys())

    def add_bot(self, bot_id, ip, port):
        """
        Adds a bot to the list of active bots, if the connection
        is established successfully.

        Args:
            bot_id (str):
            ip (str):
            port (int):
        """
        new_bot = BSBot(bot_id, ip, port=port)

        if new_bot.is_active():
            return new_bot.get_id()
        else:
            del new_bot
            raise Exception("The connection was not active. Not adding the "
                            + "bot.")

    def remove_bot(self, bot_id):
        """
        Removes minibot from list of active bots by name.

        Args:
            bot_id (str):
        """
        del self.active_bots[bot_id]
        return bot_id not in self.active_bots

    def get_bot(self, bot_id):
        return self.active_bots[bot_id]

    def discover_bots(self):
        pass

    def set_position_of_bot(self, bot_id, pos):
        pass

    # ================== SESSIONS ==================

    def list_active_sessions(self):
        pass

    def add_session(self, session_id):
        pass

    def remove_session(self, session_id):
        pass

    def add_bot_to_session(self, session_id, bot_id):
        pass

if __name__=="__main__":
    bs = BaseStation()
    bs.run(1234)