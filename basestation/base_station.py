"""
Base Station for the MiniBot.
"""

from random import choice
from string import digits, ascii_lowercase, ascii_uppercase
import os
import psutil
import re
import socket
import sys
import time
import threading
from basestation.bot import Bot

MAX_VISION_LOG_LENGTH = 1000

class BaseStation:
    def __init__(self, app_debug=False):
        self.active_bots = {}
        self.vision_log = []

        self.blockly_function_map = {
            "move_forward": "fwd",         "move_backward": "back",
            "wait": "time.sleep",          "stop": "stop",
            "set_wheel_power":             "ECE_wheel_pwr",
            "turn_clockwise": "right",     "turn_counter_clockwise": "left",
            "move_servo": "move_servo",    "read_ultrasonic": "read_ultrasonic",
        }
        # functions that run continuously, and hence need to be started
        # in a new thread on the Minibot otherwise the Minibot will get
        # stuck in an infinite loop and will be unable to receive
        # other commands
        self.blockly_threaded_functions = [
            "fwd", "back", "right", "left", "stop", "ECE_wheel_pwr"
        ]

        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        # an arbitrarily small time
        self.sock.settimeout(0.01)

        # empty string means 0.0.0.0, which is all IP addresses on the local
        # machine, because some machines can have multiple Network Interface
        # Cards, and therefore will have multiple ip_addresses
        server_address = ("0.0.0.0", 9434)

        if app_debug and os.environ["WERKZEUG_RUN_MAIN"] == "true":
            self.sock.bind(server_address)
        else:
            self.sock.bind(server_address)


    # ==================== VISION ====================

    def update_vision_log(self, value):
        """ Updates vision log. Size of log based on MAX_VISION_LOG_LENGTH """
        locations = {'id': value['id'], 'x': value['x'],
                     'y': value['y'], 'orientation': value['orientation']}
        self.vision_log.append(locations)
        if len(self.vision_log) > MAX_VISION_LOG_LENGTH:
            self.vision_log.pop(0)

    def get_vision_data(self):
        """ Returns most recent vision data """
        return self.vision_log[-1] if self.vision_log else None

    # ==================== BOTS ====================

    def get_bot(self, bot_name: str) -> Bot:
        """ Returns bot object corresponding to bot name """
        if bot_name in self.active_bots:
            return self.active_bots[bot_name]
        return None

    def get_bot_names(self):
        """ Returns a list of the Bot Names. """
        return list(self.active_bots.keys())


    def listen_for_minibot_broadcast(self):
        """ Listens for the Minibot to broadcast a message to figure out the 
        Minibot's ip address. Code taken from link below:
            https://github.com/jholtmann/ip_discovery
        """

        response = "i_am_the_base_station"
        # a minibot should send this message in order to receive the ip_address
        request_password = "i_am_a_minibot"

        buffer_size = 4096
        try:
            data, address = self.sock.recvfrom(buffer_size)
        except socket.timeout:
            data, address = b"", None
        data = str(data.decode('UTF-8'))

        if data == request_password:
            # Tell the minibot that you are the base station
            self.sock.sendto(response.encode(), address)
            self.add_bot(port=10000, ip_address=address[0])

    def add_bot(self, port: int, ip_address: str, bot_name: str = None):
        """ Adds a bot to the list of active bots """
        if not bot_name:
            bot_name = f"minibot{ip_address[-3:].replace('.', '')}"
        self.active_bots[bot_name] = Bot(bot_name, ip_address, port)
    
    def get_active_bots(self):
        """ Get the names of all the Minibots that are currently connected to 
        Basestation
        """
        for bot_name in self.get_bot_names():
            status = self.get_bot_status(bot_name)
            # if the bot is inactive, remove it from the active bots list
            if status == "INACTIVE":
                self.remove_bot(bot_name)
        return self.get_bot_names()
    
    def get_bot_status(self, bot_name: str) -> str:
        """ Gets whether the Minibot is currently connected or has been 
        disconnected.
        1. Send Minibot BOTSTATUS
        2. read from Minibot whatever Minibot has sent us.
        3. check when was the last time Minibot sent us "I'm alive"
        4. Return if Minibot is connected or not
        """
        bot = self.get_bot(bot_name)
        # ask the bot to reply whether its ACTIVE
        bot.sendKV("BOTSTATUS", "ACTIVE")
        # read the newest message from the bot
        bot.readKV()
        if bot.is_connected():
            status = "ACTIVE"
        else:
            status = "INACTIVE"
        return status

    def remove_bot(self, bot_name):
        """Removes the specified bot from list of active bots."""
        self.active_bots.pop(bot_name)

    def move_bot_wheels(self, bot_name, direction, power):
        """ Gives wheels power based on user input """
        bot = self.get_bot(bot_name)
        direction = direction.lower()
        bot.sendKV("WHEELS", direction)
    
    def send_bot_script(self, bot_name: str, script: str):
        bot = self.get_bot(bot_name)
        # reset the previous script_exec_result
        bot.script_exec_result = None
        # Regex is for bot-specific functions (move forward, stop, etc)
        # 1st group is the whitespace (useful for def, for, etc),
        # 2nd group is for func name, 3rd group is for args,
        # 4th group is for anything else (additional whitespace,
        # ":" for end of if condition, etc)
        pattern = r"(.*)bot.(\w*)\((.*)\)(.*)"
        regex = re.compile(pattern)
        program_lines = script.split('\n')
        parsed_program = []
        for line in program_lines:
            match = regex.match(line)
            if match:
                func = self.blockly_function_map[match.group(2)]
                args = match.group(3)
                whitespace = match.group(1)
                if not whitespace:
                    whitespace = ""
                parsed_line = whitespace
                if func in self.blockly_threaded_functions:
                    parsed_line += f"Thread(target={func}, args=[{args}]).start()\n"
                else:
                    parsed_line += f"{func}({args}){match.group(4)}\n"
                parsed_program.append(parsed_line)
            else:
                parsed_program.append(line + '\n')  # "normal" Python

        parsed_program_string = "".join(parsed_program)

        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)
        
    def set_bot_ports(self, ports, bot_name):
        bot = self.get_bot(bot_name)
        ports_str = " ".join([str(l) for l in ports])
        bot.sendKV("PORTS", ports_str)

    def get_bot_script_exec_result(self, bot_name: str):
        """ Retrieve the last script's execution result from the specified bot.
        """
        bot = self.get_bot(bot_name)
        # request the bot to send the script execution result
        bot.sendKV("SCRIPT_EXEC_RESULT", "")
        # try reading to see if the bot has replied
        bot.readKV()
        # this value might be None if the bot hasn't replied yet
        return bot.script_exec_result
