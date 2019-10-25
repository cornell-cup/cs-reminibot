from hardware.communication.TCP import TCP

from socket import *
from threading import Thread
import fcntl
import struct
import sys
import time
import importlib
import ast
import os
import ece_dummy_ops  # pseudo-ECE ops

# Create a UDP socket
sock = socket(AF_INET, SOCK_DGRAM)
# can bind to the same port using the same ip address
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
# can broadcast messages to all
sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

# address 255.255.255.255 allows you to broadcast to all
# ip addresses on the network
server_address = ('255.255.255.255', 9434)
message = 'i_am_a_minibot'

script_num = 0  # TODO make scripts not generate all the time


def parse_command(cmd, tcpInstance):
    """
    Parses command sent by SendKV via TCP to the bot.
    Sent from BaseStation.
    Args:
         cmd (:obj:`str`): The command name.
         tcpInstance (:obj:`str`): Payload or contents of command.
    """
    global script_num
    comma = cmd.find(",")
    start = cmd.find("<<<<")
    end = cmd.find(">>>>")
    key = cmd[start + 4:comma]
    value = cmd[comma + 1:end]
    if key == "WHEELS":
        try:
            values = value.split(",")
            print(key)
            print(values)
            # TODO: Replace code below with new set_wheel_power function
            # bot.set_wheel_power(int(values[0]), int(values[1]))
        except Exception as e:
            print(e)
            pass
    elif key == "SCRIPTS":
        if len(value) > 0:
            try:
                # TODO replace script_num
                script_name = "script" + str(script_num) + ".py"
                script_num += 1
                program = process_string(value)
                print(os.getcwd())
                # TODO modularize scripts
                file = open(
                    os.getcwd() + "/" + script_name, 'w+')
                file.write(program)
                file.close()
                p = spawn_script_process(script_name)
            except Exception as e:
                print("Exception occured")
                print(e)
                pass


def process_string(value):
    """
    Function from /minibot/main.py. Encases programs in a function
    called run(), which can later be ran when imported via the
    import library.
    """
    cmds = value.splitlines()
    program = "from ece_dummy_ops import *\n"
    program += "def run():\n"
    for i in range(len(cmds)):
        program += "    " + cmds[i] + "\n"
    print(program)
    return program


def spawn_script_process(scriptname):
    """
    Function from /minibot/main.py. Creates a new thread to run
    the script process on.
    """
    time.sleep(0.1)
    Thread(target=run_script, args=[scriptname], daemon=True).start()


def run_script(scriptname):
    """
    Function from /minibot/main.py. Tells a bot to run a script.
    """
    index = scriptname.find(".")
    # TODO after modularizing, change import module
    script = importlib.import_module(scriptname[0: index])
    script.run()


def start_base_station_heartbeat(ip_address):
    # Define broadcasting address and message
    server_address = (ip_address, 5001)
    heartbeat_message = 'Hello, I am a minibot!'

    # Send message and resend every 9 seconds
    while True:
        try:
            # Send data
            print('sending broadcast: "%s"' % heartbeat_message)
            sent = sock.sendto(message.encode(), server_address)
        except Exception as err:
            print(err)
        time.sleep(9)


try:
    server_ip = None

    # continuously try to connect to the base station
    while True:
        # Send data
        print('sending: ' + message)
        sent = sock.sendto(message.encode(), server_address)
        # Receive response
        print('waiting to receive')
        data, server = sock.recvfrom(4096)
        if data.decode('UTF-8') == 'i_am_the_base_station':
            print('Received confirmation')
            server_ip = str(server[0])
            print('Server ip: ' + server_ip)
            break
        else:
            print('Verification failed')
            print('Trying again...')

    base_station_thread = Thread(
        target=start_base_station_heartbeat, args=(server_ip,))
    base_station_thread.start()
    tcp_instance = TCP()
    while True:
        time.sleep(0.01)
        parse_command(tcp_instance.get_command(), tcp_instance)
finally:
    sock.close()
