"""
Base Station for the MiniBot.
"""

import tornado
import os

from basestation.connection.base_connection import BaseConnection
from basestation.bot.pi_bot import PiBot
from basestation.bot.sim_bot import SimBot

class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.port = None
        # self.connections = BaseConnection()

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

    def add_bot(self, bot_id, port, type, ip=None):
        """
        Adds a bot to the list of active bots, if the connection
        is established successfully.

        Args:
            bot_id (str):
            ip (str):
            port (int):
        """
        if type == "PIBOT":
            new_bot = PiBot()
        elif type == "SIMBOT":
            new_bot = SimBot()

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