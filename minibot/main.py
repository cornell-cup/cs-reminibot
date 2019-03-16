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

from os import listdir
from os.path import isfile, join

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
        parse_command(tcpCmd, bot, tcpInstance)
        time.sleep(0.01)

def parse_command(cmd, bot, tcpInstance):
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
    if key != "":
        print(key)
    if key == "WHEELS":
        try:
            values = value.split(",")
            print(values)
            bot.set_wheel_power(int(values[0]), int(values[1]))
        except Exception as e:
            print(e)
            pass
    elif key == "WINGS":
        try:
            print("HERE")
            if value == "0":
                print("flap and extend left")
                bot.left_wing()
            elif value == "1":
                print("flap left")
                bot.left_flap()
            elif value == "2":
                print("flap right")
                bot.right_flap()
            elif value == "3":
                print("flap and extend right")
                bot.right_wing()
            elif value == "4":
                print("extend left")
                bot.left_extend()
            elif value == "5":
                print("extend right")
                bot.right_extend()
            else:
                print("flap and extend both")
                bot.both_wings_flap_and_extend()
        except Exception as e:
            print(e)
            pass
    elif key == "DWHEELS":
        try:
            print("HERE")
            if value == "0":
                print("forward")
                bot.d_forward()
            elif value == "1":
                print("left")
                bot.d_left()
            elif value == "2":
                print("stop")
                bot.d_stop()
            elif value == "3":
                print("right")
                bot.d_right()
            elif value == "4":
                print("backward")
                bot.d_backward()
        except Exception as e:
            print(e)
            pass
    elif key == "BODY":
        print("PUSHUP")
        bot.push_up()
    elif key == "HEAD":
        print("HEAD")
        if value == "0":
            print("nod")
            bot.head_nod()
        elif value == "1":
            print("turn")
            bot.head_turn()
    elif key == "SCRIPTS":
        values = value.split(",")
        if len(value) == 0:
            print("GETTING SCRIPTS")
            path = "./minibot/scripts"
            files = [f for f in os.listdir(path)]
            files = ",".join(files)
            print(files)
            tcpInstance.send_to_basestation("SCRIPTS", files)
        elif len(value) == 1:
            print("RUNNING SCRIPTS")
        elif len(values) == 2:
            print("SAVING SCRIPTS")
            file = open("/home/pi/cs-reminibot/minibot/scripts/" + values[0], 'w')
            val = process_string(values[1])
            file.write(val)
            file.close()
            print(values[0])
            print(values[1])
            p = spawn_script_process(p, bot, values[0])
    elif key == "BOTSTATUS":
        print("getting bot status")
        status = {}
        status["motor_power"] = bot.get_wheel_power()
        status["sensor_data"] = bot.get_sensor_data()
        
        status = str(status).replace("'", "\"")
        tcpInstance.send_to_basestation("BOTSTATUS", status)
    elif key == "GUN":
        print("minibot copied fire command")
        bot.fire()

def process_string(value):
    cmds = value.splitlines()
    str = "def run(bot):\n"
    for i in range(len(cmds)):
        str += "    " + cmds[i]+ "\n"
    print(str)
    return str

def spawn_script_process(p, bot, scriptname):
    time.sleep(0.1)
    p = Thread(target=run_script, args=[bot, scriptname])
    p.start()
    return p

def run_script(bot, scriptname):
    index = scriptname.find(".")
    script = importlib.import_module("minibot.scripts." + scriptname[0: index])
    script.run(bot)

if __name__ == "__main__":
    main()
