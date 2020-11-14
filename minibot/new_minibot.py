from hardware.communication.TCP import TCP

from socket import *
from threading import Thread
import struct
import sys
import time
import importlib
import ast
import os
import concurrent.futures
from multiprocessing import Process, Manager, Value
from ctypes import c_char_p

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

# Bot library name is stored here
BOT_LIB_FUNCS = "PiArduino"

# Load the ECE Dummy ops if testing, real bot-level function library otherwise.
# ECE dummy ops replace physical bot outputs with print statements.
if (len(sys.argv) == 2) and (sys.argv[1] == "-t"):
    import scripts.ece_dummy_ops as ece
    BOT_LIB_FUNCS = "ece_dummy_ops"
else:
    import scripts.pi_arduino as ece
    BOT_LIB_FUNCS = "pi_arduino"

current_process = None


def parse_command(cmd, tcpInstance):
    """
    Parses command sent by SendKV via TCP to the bot.
    Sent from BaseStation.
    Args:
         cmd (:obj:`str`): The command name.
         tcpInstance (:obj:`str`): Payload or contents of command.
    """
    global current_process 

    comma = cmd.find(",")
    start = cmd.find("<<<<")
    end = cmd.find(">>>>")
    key = cmd[start + 4:comma]
    value = cmd[comma + 1:end]

    # All ECE commands need to be called under separate threads because each
    # ECE function contains an infinite loop.  If we did not have the threads,
    # our code execution pointer would get stuck in the infinite loop.
    if key == "WHEELS":
        if value == "forward":
            Thread(target=ece.fwd, args=[50]).start()
        elif value == "backward":
            Thread(target=ece.back, args=[50]).start()
        elif value == "left":
            Thread(target=ece.left, args=[50]).start()
        elif value == "right":
            Thread(target=ece.right, args=[50]).start()
        else:
            Thread(target=ece.stop).start()
            if current_process is not None:
                current_process.terminate()

    elif key == "MODE":
        if value == "object_detection":
            print("Object Detection")
            Thread(target=ece.object_detection).start()
        elif value == "line_follow":
            print("Line Follow")
            Thread(target=ece.line_follow).start()

    elif key == "PORTS":
        ece.set_ports(value)
        print("Set Ports")

    elif key == "SCRIPTS":
        # The script is always named bot_script.py.
        if len(value) > 0:
            try:
                script_name = "bot_script.py"
                program = process_string(value)

                # file_dir is the path to folder this file is in
                file_dir = os.path.dirname(os.path.realpath(__file__))
                file = open(
                    file_dir + "/scripts/" + script_name, 'w+')
                file.write(program)
                file.close()
                # Run the Python program in a different process so that we 
                # don't need to wait for it to terminate and we can kill it
                # whenever we want.
                time.sleep(0.1)
                current_process = Process(target=run_script, args=(script_name, tcpInstance))
                current_process.start()
            except Exception:
                pass


def process_string(value):
    """
    Function from /minibot/main.py. Encases programs in a function
    called run(), which can later be ran when imported via the
    import library. Also adds imports necessary to run bot functions.
    Args:
        value (:obj:`str`): The program to format.
    """
    cmds = value.splitlines()
    program = "from scripts." + BOT_LIB_FUNCS + " import *\n"
    program += "import time\n"
    program += "from threading import *\n"
    program += "def run():\n"
    for i in range(len(cmds)):
        cmds[i] = cmds[i].replace(u'\xa0', u' ')
        program += "    " + cmds[i] + "\n"
    return program


def run_script(scriptname, tcp_instance):
    """
    Loads a script and runs it.
    Args:
        scriptname (str): The name of the script to run.
        tcp_instance (object): TCP object for communication.
    """

    # Cache invalidation and module refreshes are needed to ensure
    # the most recent script is executed
    try:
        index = scriptname.find(".")
        importlib.invalidate_caches()
        script_name = "scripts." + scriptname[0: index]
        script = importlib.import_module(script_name)
        importlib.reload(script)
        script.run()
        result = "Successful execution"
        tcp_instance.send_to_basestation("ERRORMESSAGE", result)
    except Exception as exception:
        str_exception = str(type(exception)) + ": " + str(exception)
        result = str_exception
        tcp_instance.send_to_basestation("ERRORMESSAGE", result)


def start_base_station_heartbeat(ip_address):
    """
    Starts the heartbeat messages to signal to the server that
    a bot is still connected.
    Args:
        ip_address (:obj:`str`): The IP address of the server to contact
    """
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


def main():
    try:
        server_ip = None

        # continuously try to connect to the base station
        isTimeOut = True
        while True:
            # try connecting to the basestation every sec until connection is made
            sock.settimeout(1.0)

            # keep trying to connect even if the connection is timing out.
            # isTimeOut only becomes False if the connection is successfully
            # established.
            while (isTimeOut):
                try:
                    # Send data
                    print('sending: ' + message)
                    sent = sock.sendto(message.encode(), server_address)
                    # Receive response
                    print('waiting to receive')
                    data, server = sock.recvfrom(4096)
                    isTimeOut = False
                except Exception as err:
                    print(err)

            if data.decode('UTF-8') == 'i_am_the_base_station':
                print('Received confirmation')
                server_ip = str(server[0])
                print('Server ip: ' + server_ip)
                break
            else:
                print('Verification failed')
                print('Trying again...')

        base_station_thread = Thread(
            target=start_base_station_heartbeat, args=(server_ip,), daemon=True
        )
        base_station_thread.start()
        tcp_instance = TCP()
        while True:
            time.sleep(0.01)
            parse_command(tcp_instance.get_command(), tcp_instance)

    finally:
        sock.close()


if __name__ == "__main__":
    main()
