"""
Base Station for the MiniBot.
"""

# external
from random import choice
from string import digits, ascii_lowercase, ascii_uppercase

# internal
# from connection.base_connection import BaseConnection
from bot.pi_bot import PiBot
from bot.sim_bot import SimBot
from session.session import Session

class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.active_playgrounds = {}
        # self.connections = BaseConnection()

    # ==================== ID GENERATOR ====================

    def generate_id(self):
        """
        Generates a unique 5 character id composed of digits, lowercase, 
        and uppercase letters.
        """
        chars = digits + ascii_lowercase + ascii_uppercase
        unique_id = "".join([choice(chars) for i in range(7)])
        return unique_id

    # ==================== BOTS ====================

    def list_active_bots_names(self):
        """
        Returns a list of the Bot IDs.

        Returns:
            (list<str>): List of IDs of all active bots.
        """
        return list(self.active_bots.keys())

    def add_bot(self, bot_name, port, type, ip=None):
        """
        Adds a bot to the list of active bots, if the connection
        is established successfully.

        Args:
            bot_id (str):
            ip (str):
            port (int):
        """
        bot_id = self.generate_id()
        if type == "PIBOT":
            new_bot = PiBot(bot_id, bot_name, ip, port)
        elif type == "SIMBOT":
            new_bot = SimBot()

        self.active_bots[bot_id] = new_bot

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

    def bot_name_to_bot_id(self, bot_name):
        for bot_id, bot in self.active_bots.items():
            if bot.get_name() == bot_name:
                return bot_id
        return None

    def move_wheels_bot(self, session_id, bot_id, direction, power):
        session = self.active_sessions[session_id]
        if not session or not session.has_bot(bot_id):
            return False

        direction = direction.lower()
        neg_power = "-" + power
        if direction == "forward" or direction == "fw":
            value = ",".join([power, power, power, power])
        elif direction == "backward" or direction == "bw":
            value = ",".join([neg_power, neg_power, neg_power, neg_power])
        elif direction == "left" or direction == "lt":
            value = ",".join([neg_power, power, neg_power, power])
        elif direction == "right" or direction == "rt":
            value = ",".join([power, neg_power, power, neg_power])
        else:
            value = "0,0,0,0"

        self.active_bots[bot_id].sendKV("WHEELS", value)
        return True

    def get_bot(self, bot_id):
        return self.active_bots[bot_id]

    def discover_bots(self):
        pass

    def set_position_of_bot(self, bot_id, pos):
        pass

    # ================== SESSIONS ==================

    def list_active_sessions(self):
        """
        Returns all of the session_id in active_sessions

        Returns:
            list : list of session_id
        """
        return self.active_sessions.keys()

    def has_session(session_id):
        """
        Returns True if session_id exists in active_sessions

        Returns:
            boolean
        """
        return session_id in self.active_sessions

    def add_session(self):
        """
        Adds a new session to active_sessions

        Returns:
            session_id (str): a unique id
        """
        session_id = self.generate_id()
        self.active_sessions[session_id] = Session(session_id)
        return session_id

    def remove_session(self, session_id):
        """
        Removes a session from active_sessions

        Argss:
            session_id (str): a unique id
        """
        del self.active_sessions[session_id]
        return session_id not in self.active_sessions

    def add_bot_to_session(self, session_id, bot_id):
        """
        Adds bot id to session given session id.

        Argss:
            session_id (str): a unique id
            bot_id (str): a unique id
        """
        if bot_id not in self.active_bots:
            raise Exception("Bot is not active. Failed to add bot" + bot_id + " to session " + session_id)
        bot = self.active_bots[bot_id]
        return self.active_sessions[session_id].add_bot_id_to_session(bot.get_id())