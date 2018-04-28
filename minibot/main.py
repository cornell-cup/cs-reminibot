"""
Script which is automatically run on the MiniBot's Pi upon startup.
Must be configured in /etc/init.d/minibotinit.sh on the RPi.
"""

from minibot.bot import Bot
from minibot.hardware.communication.TCP import TCP
import minibot.hardware.communication.UDP

import json
from threading import Thread
import time
import importlib
import os

"""
    Loads UserScript file.
    Reloads file when it is run from GUI to reflect changes.
"""

CONFIG_LOCATION = '/home/pi/cs-reminibot/minibot/configs/config.json'

p = None
def main():
    print("Initializing Minibot Software")
    p = None
    config_file = open(CONFIG_LOCATION)
    config = json.loads(config_file.read())
    bot = Bot(config)
    tcpInstance = TCP()
    print(tcpInstance)
    thread_udp = Thread(target= minibot.hardware.communication.UDP.udpBeacon)
    thread_udp.start()
    while True:
        tcpCmd = tcpInstance.get_command()
        parse_command(tcpCmd, bot)
        time.sleep(0.01)

def parse_command(cmd, bot):
    """
    Parses command sent by SendKV via TCP to the bot.
    Sent from BaseStation.
    Args:
         cmd (:obj:`str`): The command name.
         bot (:obj:`Bot`): Bot object to run the command on.
         p (:obj:`str`): Payload or contents of command.
    """
    global p
    comma = cmd.find(",")
    start = cmd.find("<<<<")
    end = cmd.find(">>>>")
    key = cmd[start + 4:comma]
    value = cmd[comma + 1:end]
    if key == "WHEELS":
        try:
            values = value.split(",")
            bot.set_wheel_power(int(values[0]), int(values[1]))
        except Exception as e:
            print(e)
            pass
    elif key == "SCRIPTS":
        values = value.split(",")
        if len(values) == 0:
            print("GETTING SCRIPTS")
        elif len(values) == 1:
            print("RUNNING SCRIPTS")
        elif len(values) == 2:
            print("SAVING SCRIPTS")

if __name__ == "__main__":
    main()
