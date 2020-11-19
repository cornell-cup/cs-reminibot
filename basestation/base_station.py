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
from bot import Bot

# internal
# from connection.base_connection import BaseConnection

MAX_VISION_LOG_LENGTH = 1000


class BaseStation:
    def __init__(self):
        self.active_bots = {}
        self.active_playgrounds = {}
        self.vision_log = []

        # Send a message on a specific port so that the minibots can discover the ip address
        # of the computer that the BaseStation is running on.
        self.listen_for_minibot_broadcast_thread = threading.Thread(
            target=self.listen_for_minibot_broadcast, daemon=True
        )
        self.listen_for_minibot_broadcast_thread.start()

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

    def get_vision_log(self):
        """
        Returns entire vision log.
        """
        return self.vision_log

    # ==================== BOTS ====================

    def listen_for_minibot_broadcast(self):
        """ Listens for the Minibot to broadcast a message to figure out the 
        Minibot's ip address.
        Author: virenvshah (code taken from link below)
            https://github.com/jholtmann/ip_discovery
        """
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
        Returns a list of the Bot Names.

        Returns:
            (list<str>): List of Names of all active bots.
        """
        return list([bot.name for _, bot in self.active_bots.items()])


    def add_bot(self, port, ip_address, bot_name=None):
        """
        Adds a bot to the list of active bots, if the connection
        is established successfully.

        Args:
            ip (str):
            port (int):

        Return:
            id of newly added bot
        """
        if not bot_name:
            bot_name = "minibot" + \
                ip_address[len(ip_address)-3:].replace('.', '')

        new_bot = Bot(bot_name, ip_address, port)
        self.active_bots[bot_name] = new_bot
    
    def get_bot_status(self, bot):
        """ Gets whether the Minibot is currently connected or has been 
        disconnected.  This is done by di
        1. Send Minibot BOTSTATUS
        2. read from Minibot whatever Minibot has sent us.
        3. check when was the last time Minibot sent us "I'm alive"
        4. Return if Minibot is connected or not
        """
        bot.sendKV("BOTSTATUS", "ACTIVE")
        bot.readKV()
        if bot.is_connected():
            status = "ACTIVE"
        else:
            status = "INACTIVE"
        return status

    def remove_bot(self, bot_name):
        """
        Removes minibot from list of active bots by name.

        Args:
            bot_name (str): bot name of removed bot
        """
        self.active_bots.pop(bot_name)
        return bot_name not in self.active_bots

    def move_wheels_bot(self, bot_name, direction, power):
        """
        Gives wheels power based on user input
        """
        direction = direction.lower()
        self.active_bots[bot_name].sendKV("WHEELS", direction)

    def get_bot(self, bot_name):
        """
        Returns bot object corresponding to bot id
        """
        if bot_name in self.active_bots:
            return self.active_bots[bot_name]
        else:
            return None

    def get_bots_ip_address(self):
        """
        Returns a list of the ip addresses of all active bots.
        """
        return {bot.get_ip(): bot.get_id() for _, bot in self.active_bots.items()}

    def set_ports(self, ports, bot_name):
        for x in ports:
            print(x)

        portsstr = " ".join([str(l) for l in ports])

        self.active_bots[bot_name].sendKV("PORTS", portsstr)

    # ================== BASESTATION GUI ==================

    def get_script_exec_result(self, bot_name):
        """
        Retrieve Python error message from pi_bot.py.

        Args:
            bot_name (str): Name of the bot that run the Python program
        """
        bot = self.get_bot(bot_name)
        bot.sendKV("SCRIPT_EXEC_RESULT", "")
        bot.readKV()
        return bot.script_exec_result
