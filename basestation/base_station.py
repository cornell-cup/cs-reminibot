"""
Base Station for the MiniBot.
"""

# external
from random import choice
from string import digits, ascii_lowercase, ascii_uppercase
from bot import Bot
import socket
import sys
import time
import threading

# internal
# from connection.base_connection import BaseConnection
from session.session import Session

MAX_VISION_LOG_LENGTH = 1000


class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.active_playgrounds = {}
        self.vision_log = []

        # Send a message on a specific port so that the minibots can discover the ip address
        # of the computer that the BaseStation is running on.
        self.broadcast_ip_thread = threading.Thread(
            target=self.broadcast_ip, daemon=True
        )

        self.vision_monitior_thread = threading.Thread(
            target=self.vision_monitior, daemon=True
        )

        self.broadcast_ip_thread.start()
        self.vision_monitior_thread.start()
        self.basestation_key = ""
    # ==================== ID GENERATOR ====================

    def generate_id(self, length=7):
        """
        Generates a unique 7 character id composed of digits, lowercase, 
        and uppercase letters
        """
        chars = digits + ascii_lowercase + ascii_uppercase
        unique_id = "".join([choice(chars) for i in range(length)])
        return unique_id

    # ==================== VISION ====================

    def update_vision_log(self, value):
        """
        Updates vision log. Size of log based on MAX_VISION_LOG_LENGTH
        Args:
            values (dict): dictionary containing positions 
        """
        locations = {'id': value['id'], 'x': value['x'],
                     'y': value['y'], 'orientation': value['orientation']}
        # print("Received1 vision info: ", locations)
        self.vision_log.append(locations)
        if len(self.vision_log) > MAX_VISION_LOG_LENGTH:
            self.vision_log.pop(0)
            self.vision_log.pop(0)

    def get_vision_data(self):
        """
        Returns most recent vision data
        """
        if self.vision_log:
            return self.vision_log[-1]
        else:
            return None

    def vision_monitior(self):
        """
        Checks if the len of the vision log is growing.
        """
        locations = {'id': '', 'x': '',
                     'y': '', 'orientation': ''}
        while True:
            if self.vision_log:
                count = len(self.vision_log)
                time.sleep(1)
                if len(self.vision_log) == count and self.vision_log[-1]['x'] != '':
                    self.vision_log.append(locations)

    def get_vision_log(self):
        """
        Returns entire vision log.
        """
        return self.vision_log

    # ==================== BOTS ====================

    def broadcast_ip(self):
        """ Broadcasts ip address of the computer that the BaseStation is running on
        so that other minibots can connect to the BaseStation.

        Returns: None

        Author: virenvshah (code taken from link below)
            https://github.com/jholtmann/ip_discovery
        """
        print("IP broadcast starting")

        # initialize the socket, AF_INET for IPv4 addresses,
        # SOCK_DGRAM for UDP connections
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

        # empty string means 0.0.0.0, which is all IP addresses on the local
        # machine, because some machines can have multiple Network Interface
        # Cards, and therefore will have multiple ip_addresses
        server_address = ("", 9434)
        sock.bind(server_address)

        response = "i_am_the_base_station"
        # a minibot should send this message in order to receive the ip_address
        request_password = "i_am_a_minibot"

        while True:
            buffer_size = 4096
            data, address = sock.recvfrom(buffer_size)
            data = str(data.decode('UTF-8'))

            if data == request_password:
                # Tell the minibot that you are the base station
                sock.sendto(response.encode(), address)
                self.add_bot(port=10000, ip_address=address[0])

    def get_active_bots_names(self):
        """
        Returns a list of the Bot IDs.

        Returns:
            (list<str>): List of IDs of all active bots.
        """
        return list([bot.name for _, bot in self.active_bots.items()])

    def add_bot(self, port, ip_address, bot_name=None):
        """
        Adds a bot to the list of active bots, if the connection
        is established successfully.

        Args:
            bot_id (str):
            ip (str):
            port (int):

        Return:
            id of newly added bot
        """
        bot_id = self.generate_id()
        if not bot_name:
            bot_name = "minibot" + ip_address[len(ip_address)-3:].replace('.', '')

        new_bot = Bot(bot_id, bot_name, ip_address, port)
        self.active_bots[bot_id] = new_bot


    def remove_bot(self, bot_id):
        """
        Removes minibot from list of active bots by name.

        Args:
            bot_id (str): bot id of removed bot

        Return:
            True if bot was successfully removed
            False otherwise
        """
        del self.active_bots[bot_id]
        return bot_id not in self.active_bots

    def bot_name_to_bot_id(self, bot_name):
        """
        Returns bot id corresponding to bot name

        Args:
            bot_name (str):

        """
        for bot_id, bot in self.active_bots.items():
            if bot.name == bot_name:
                return bot_id
        return None

    def move_wheels_bot(self, session_id, bot_id, direction, power):
        """
        Gives wheels power based on user input

        Args:
            session_id:
            bot_id:
            direction:
            power:

        Return:
            True if bot successfully received direction
            False otherwise
        """
        if not session_id or not bot_id:
            return False

        session = self.active_sessions[session_id]
        if not session or not session.has_bot(bot_id):
            return False

        direction = direction.lower()
        print("Active bot " + str(type(self.active_bots[bot_id])))
        self.active_bots[bot_id].sendKV("WHEELS", direction)
        return True

    def get_bot(self, bot_id):
        """
        Returns bot object corresponding to bot id

        Args:
            bot_id:
        """
        if bot_id in self.active_bots:
            return self.active_bots[bot_id]
        else:
            return None

    def get_bots_ip_address(self):
        """
        Returns a list of the ip addresses of all active bots.
        """
        return {bot.get_ip(): bot.id for _, bot in self.active_bots.items()}

    def get_bot_sessions(self, bot_id):
        """
        Returns a list of session_id connected to the bot associated with bot_id.
        """
        sessions = []
        for session_id, session in self.active_sessions.items():
            if session.has_bot(bot_id):
                sessions.append(session_id)
        return sessions

    def set_ports( self, ports, session_id, bot_id ):
        if not session_id or not bot_id:
            return False

        session = self.active_sessions[session_id]
        if not session or not session.has_bot(bot_id):
            return False
        for x in ports:
            print(x)
        
        portsstr = " ".join([str(l) for l in ports])

        self.active_bots[bot_id].sendKV("PORTS", portsstr)
        
        #do something

        return True

    # ================== SESSIONS ==================

    def list_active_sessions(self):
        """
        Returns all of the session_id in active_sessions

        Returns:
            list : list of session_id
        """
        return self.active_sessions.keys()

    def has_session(self, session_id):
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

    def add_bot_to_session(self, session_id, bot_name):
        """
        Adds bot id to session given session id and bot name.

        Args:
            session_id (str): a unique id
            bot_id (str): a unique id
        """

        print("session_id is:")
        print(session_id)
        print("bot_name is: ")
        print(bot_name)

        print(self.active_bots)

        bot_id = self.bot_name_to_bot_id(bot_name)
        if bot_id in self.active_bots:
            bot = self.active_bots[bot_id]
            return self.active_sessions[session_id].add_bot_id_to_session(bot.id)
        else:
            return False

    def remove_bot_from_session(self, session_id, bot_id):
        """"
        Removes bot from session

        Args:
            session_id (str): a unique id
            bot_id (str): a unique id
        """
        session = self.active_sessions[session_id]
        session.remove_bot_id_from_session(bot_id)

    # ================== BASESTATION GUI ==================

    def get_base_station_key(self):
        """
        Returns basestation key to access basestation gui. If there is no key, a key is randomly generated
        """
        if self.basestation_key == "":
            self.basestation_key = self.generate_id()
        return self.basestation_key

    def get_error_message(self, bot_name):
        bot_id = self.bot_name_to_bot_id(bot_name)
        bot = self.active_bots[bot_id]
        return bot.get_result()