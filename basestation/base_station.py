"""
Base Station for the MiniBot.
"""

# external
from random import choice
from string import digits, ascii_lowercase, ascii_uppercase

# internal
# from connection.base_connection import BaseConnection
from bot.base_station_bot import BaseStationBot as BSBot
from session.session import Session

class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.active_playgrounds = {}
        # self.connections = BaseConnection()

    # ==================== ID GENERATOR ====================

    def generate_id():
        """
        Generates a unique 5 character id composed of digits, lowercase, 
        and uppercase letters.
        """
        chars = digits + ascii_lowercase + ascii_uppercase
        unique_id = "".join([choices(chars) for i in range(5)])
        return unique_id

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
        # return self.active_sessions.keys()
        return "hey there bb"

    def has_session(session_id):
        return session_id in self.active_sessions

    def add_session(self):
        session_id = generate_id()
        self.active_sessions[session_id] = Session(session_id)
        return session_id in self.active_sessions

    def remove_session(self, session_id):
        del self.active_sessions[session_id]
        return session_id not in self.active_sessions

    def add_bot_to_session(self, session_id, bot_id):
        if bot_id not in self.active_bots:
            raise Exception("Bot is not active. Failed to add bot" + bot_id + " to session " + session_id)
        bot = self.active_bots[bot_id]
        return self.active_sessions[session_id].add_bot_id_to_session(bot.get_id())