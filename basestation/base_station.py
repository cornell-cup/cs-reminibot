"""
Base Station for the MiniBot.
"""

# external
from random import choice
from string import digits, ascii_lowercase, ascii_uppercase
import socket
import sys
import time
import threading

# internal
# from connection.base_connection import BaseConnection
from bot.pi_bot import PiBot
from bot.sim_bot import SimBot
from session.session import Session
from connection.udp_connection import UDPConnection

MAX_VISION_LOG_LENGTH = 1000


class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_sessions = {}
        self.active_playgrounds = {}
        self.vision_log = []

        self.__udp_connection = UDPConnection()
        self.__udp_connection.start()

        # Send a message on a specific port so that the minibots can discover the ip address
        # of the computer that the BaseStation is running on.
        self.broadcast_ip_thread = threading.Thread(
            target=self.broadcast_ip, daemon=True
        )

        self.bot_discover_thread = threading.Thread(
            target=self.discover_and_create_bots, daemon=True
        )
        self.broadcast_ip_thread.start()
        self.bot_discover_thread.start()
        # self.connections = BaseConnection()

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
                     'y': value['y'], 'z': value['z']}
        # print("Received1 vision info: ", locations)
        self.vision_log.append(locations)
        if len(self.vision_log) > MAX_VISION_LOG_LENGTH:
            self.vision_log.pop(0)

    def get_vision_data(self):
        """
        Returns most recent vision data
        """
        if self.vision_log:
            return self.vision_log[-1]
        else:
            return None

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
            data, address = sock.recvfrom(4096)
            data = str(data.decode('UTF-8'))

            if data == request_password:
                # Tell the minibot that you are the base station
                sent = sock.sendto(response.encode(), address)

    def get_active_bots_names(self):
        """
        Returns a list of the Bot IDs.

        Returns:
            (list<str>): List of IDs of all active bots.
        """
        return list([bot.get_name() for _, bot in self.active_bots.items()])

    def discover_and_create_bots(self):
        """
        Discovers active bots, creates an Bot object for each one, and stores 
        them in active bots. If existing bot is not active, remove it from active_bots.
        """
        while True:
            avaliable_bots = self.discover_bots()
            added_bots_ip_dict = self.get_bots_ip_address()
            for ip in avaliable_bots:
                if ip in added_bots_ip_dict:
                    bot_id = added_bots_ip_dict[ip]
                    if not self.get_bot(bot_id).is_active():
                        self.__udp_connection.set_address_inactive(ip)
                        self.remove_bot(bot_id)
                else:
                    if self.__udp_connection.is_address_active(ip):
                        self.add_bot(port=10000, type="PIBOT", ip=ip)
            time.sleep(1)

    def add_bot(self, port, type, ip=None, bot_name=None):
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
            bot_name = "minibot" + ip[len(ip)-3:].replace('.', '')

        if type == "PIBOT":
            new_bot = PiBot(bot_id, bot_name, True, ip, port)
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
            if bot.get_name() == bot_name:
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
        # neg_power = "-" + power
        # if direction == "forward" or direction == "fw":
        #     value = ",".join([power, power, power, power])
        # elif direction == "backward" or direction == "bw":
        #     value = ",".join([neg_power, neg_power, neg_power, neg_power])
        # elif direction == "left" or direction == "lt":
        #     value = ",".join([neg_power, power, neg_power, power])
        # elif direction == "right" or direction == "rt":
        #     value = ",".join([power, neg_power, power, neg_power])
        # else:
        #     value = "0,0,0,0"
        # TODO remove print
        print("Active bot " + str(type(self.active_bots[bot_id])))
        self.active_bots[bot_id].sendKV("WHEELS", direction)
        return True

    # def move_wings_bot(self, session_id, bot_id, power):
    #     if not session_id or not bot_id:
    #         return False
    #
    #     session = self.active_sessions[session_id]
    #     if not session or not session.has_bot(bot_id):
    #         return False
    #
    # def move_tail_bot(self, session_id, bot_id, power):
    #     if not session_id or not bot_id:
    #         return False
    #
    #     session = self.active_sessions[session_id]
    #     if not session or not session.has_bot(bot_id):
    #         return False
    #
    # def move_tail_bot(self, session_id, bot_id, power):
    #     if not session_id or not bot_id:
    #         return False
    #
    #     session = self.active_sessions[session_id]
    #     if not session or not session.has_bot(bot_id):
    #         return False
    #
    # def move_jaw_bot(self, session_id, bot_id, direction, power):
    #     if not session_id or not bot_id:
    #         return False
    #
    #     session = self.active_sessions[session_id]
    #     if not session or not session.has_bot(bot_id):
    #         return False
    #
    # def move_body_bot(self, session_id, bot_id, direction, power):
    #     if not session_id or not bot_id:
    #         return False
    #
    #     session = self.active_sessions[session_id]
    #     if not session or not session.has_bot(bot_id):
    #         return False

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

    def discover_bots(self):
        """
        Returns a list of the names of PiBots, which are detectable
        through UDP broadcast.
        """
        return list(self.__udp_connection.get_addresses())

    def get_bots_ip_address(self):
        """
        Returns a list of the ip addresses of all active bots.
        """
        return {bot.get_ip(): bot.get_id() for _, bot in self.active_bots.items()}

    def get_bot_sessions(self, bot_id):
        """
        Returns a list of session_id connected to the bot associated with bot_id.
        """
        sessions = []
        for session_id, session in self.active_sessions.items():
            if session.has_bot(bot_id):
                sessions.append(session_id)
        return sessions

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

    def remove_session(self, session_id):
        """
        Removes a session from active_sessions

        Args:
            session_id (str): a unique id
        """
        del self.active_sessions[session_id]
        return session_id not in self.active_sessions

    def add_bot_to_session(self, session_id, bot_name):
        """
        Adds bot id to session given session id and bot name.

        Args:
            session_id (str): a unique id
            bot_id (str): a unique id
        """
        bot_id = self.bot_name_to_bot_id(bot_name)
        if bot_id in self.active_bots:
            bot = self.active_bots[bot_id]
            return self.active_sessions[session_id].add_bot_id_to_session(bot.get_id())
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

    def get_bot_privacy(self, bot_id):
        """
        Returns true if bot is private, false otherwise

        Args:
            bot_id (str): a unique id
        """
        if bot_id not in self.active_bots:
            print(str(bot_id) + " is not active")
            return True
        bot = self.active_bots[bot_id]
        return bot.get_is_private()

    def set_bot_privacy(self, bot_id, session_id, is_private):
        """
        Sets privacy of bot. Returns false if bot id is not associated with
        an active bot

        Args:
            bot_id (str): a unique id
            is_private (bool): true if private, false otherwise
        """
        if bot_id not in self.active_bots:
            print(str(bot_id) + " is not active")
            return False

        if not self.active_sessions[session_id].has_bot(bot_id):
            print("session " + str(session_id) +
                  " does not own " + str(bot_id))
            return False

        bot = self.active_bots[bot_id]
        bot.set_is_private(is_private)

    # ================== BASESTATION GUI ==================

    def get_base_station_key(self):
        """
        Returns basestation key to access basestation gui. If there is no key, a key is randomly generated
        """
        if self.basestation_key == "":
            self.basestation_key = self.generate_id()
        return self.basestation_key

    def get_bots_info(self):
        """
        Returns information on every active bot with newline
        """
        bot_info = ""
        for bot_id, bot in self.active_bots.items():
            # "^" used for split function on frontend
            sessions = []
            for session_id in self.get_bot_sessions(bot_id):
                sessions.append((session_id, "Connected " +
                                 self.active_sessions[session_id].get_time_connected_to_bot_id(bot_id)))

            bot_info = bot_info + "Name:^ " + str(bot.get_name()) + "\n" \
                + "Id:^ " + str(bot.get_id()) + "\n" \
                + "Private?:^ " + str(bot.get_is_private()) + "\n" \
                + "IP:^ " + str(bot.get_ip()) + "\n" \
                + "Port:^ " + str(bot.get_port()) + "\n" \
                + "Sessions:^ " + str(sessions) + "\n" + "\n"
        return bot_info
