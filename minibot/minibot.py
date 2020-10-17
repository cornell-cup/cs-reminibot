from TCP import MinibotTCPConnection as TCP
from select import select
from socket import socket, timeout, AF_INET, SOCK_STREAM, SOCK_DGRAM 
from socket import SOL_SOCKET, SO_REUSEADDR, SO_BROADCAST
from typing import Tuple
import struct
import sys
import time
import importlib
import ast
import os
import concurrent.futures
from threading import Thread

# TODO: use argparser to handle the -t
# Load the ECE Dummy ops if testing, real bot-level function library otherwise.
# ECE dummy ops replace physical bot outputs with print statements.
if len(sys.argv) == 2 and sys.argv[1] == "-t":
    import scripts.ece_dummy_ops as ece
    BOT_LIB_FUNCS = "ece_dummy_ops"
else:
    import scripts.pi_arduino as ece
    BOT_LIB_FUNCS = "pi_arduino"


class Minibot: 
    # address refers to ip_address and port
    BROADCAST_ADDRESS = ('255.255.255.255', 9434)
    MINIBOT_MESSAGE = "i_am_a_minibot"
    BASESTATION_MESSAGE = "i_am_the_basestation"

    def __init__(self):
        # Create a UDP socket.  We want to establish a TCP (reliable) connection
        # between the basestation and the  
        self.broadcast_sock = socket(AF_INET, SOCK_DGRAM)
        # can bind to the same port using the same ip address
        self.broadcast_sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        # can broadcast messages to all
        self.broadcast_sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)
        # listens for a TCP connection from the basestation
        self.listener_sock = None

        # contains sockets which we are expecting to receive some data on
        self.readable_socks = []
        # contains sockets which we want to send some data on
        self.writable_socks = []
        # contains sockets that throw errors that we care about and want to 
        # react to
        self.errorable_socks = []
        self.sock_lists = [
            self.readable_socks, self.writable_socks, self.errorable_socks
        ]

    @staticmethod
    def parse_command(cmd):
        """
        Parses command sent by SendKV via TCP to the bot.
        Sent from BaseStation.
        Args:
             cmd (:obj:`str`): The command name.
             tcpInstance (:obj:`str`): Payload or contents of command.
        """
        comma = cmd.find(",")
        start = cmd.find("<<<<")
        end = cmd.find(">>>>")
        key = cmd[start + 4:comma]
        value = cmd[comma + 1:end]

        # All ECE commands need to be called under separate threads because each
        # ECE function contains an infinite loop.  This is because there was 
        # data loss between the Raspberry Pi and the Arduino which is why the 
        # Raspberry Pi needs to continuously repeat the command to the Arduino  
        # so that some of the commands get through.  Once the data loss issue
        # is fixed, we can implement a regular solution. If we did not have the 
        # threads, our code execution pointer would get stuck in the infinite loop.
        if key == "WHEELS":
            # TODO implement the code below using dictionaries
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
                    return_value = spawn_script_process(script_name)
                    return return_value
                except Exception as exception:
                    print("Exception occurred at compile time")
                    str_exception = str(type(exception)) + ": " + str(exception)
                    return str_exception

    @staticmethod
    def process_string(self, value):
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

    @staticmethod
    def spawn_script_process(scriptname):
        """
        Creates a new thread to run the script process on.
        Args:
            scriptname (:obj:`str`): The name of the script to run.
        """
        time.sleep(0.1)

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(run_script, scriptname)
            return_value = future.result()
            return return_value

    @staticmethod
    def run_script(scriptname):
        """
        Loads a script and runs it.
        Args:
            scriptname (:obj:`str`): The name of the script to run.
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
            return "Successful execution"
        except Exception as exception:
            print("Exception occurred at run time")
            print(type(exception))
            print(str(exception))
            str_exception = str(type(exception)) + ": " + str(exception)
            return str_exception

    def broadcast_to_base_station(self):
        """ Establishes a TCP connection to the basestation.  This connection is 
        used to receive commands from the basestation, and send replies if necessary
        """
        print("Broadcasting message to basestation.")
        # try connecting to the basestation every 2 sec until connection is made
        self.broadcast_sock.settimeout(2.0)
        data = ""
        # broadcast message to basestation
        try:
            message_byte_str = Minibot.MINIBOT_MESSAGE.encode()
            # use sendto() instead of send() for UDP
            self.broadcast_sock.sendto(
                message_byte_str, Minibot.BROADCAST_ADDRESS
            )
            data = self.broadcast_sock.recv(4096)
        except timeout:
            print("Timed out")
            
        # TODO this security policy is stupid.  We should be doing 
        # authentication after we create the TCP connection and also we should
        # be using some service like WebAuth to obtain a shared key to encrypt
        # messages.  Might be a fun project to work on at some point but not
        # necessary for a functional Minibot system, but necessary for a secure
        # Minibot system.
        if data:
            if data.decode('UTF-8') == 'i_am_the_base_station':
                print("Basestation replied!")
            else:
                # if verification fails we just print but don't do anything
                # about the fact that verification failed.  Please fix when
                # rewriting the security policy
                print('Verification failed.')

    def create_listener_sock(self):
        self.listener_sock = socket(AF_INET, SOCK_STREAM)
        # "" means bind to all addresses on this device.  Port 10000 was 
        # randomly chosen as the port to bind to
        self.listener_sock.bind(("", 10000))
        # Make socket start listening
        print("Waiting for TCP connection from basestation")
        self.listener_sock.listen()
    
    def close_sock(self, sock):
        for sock_list in self.sock_lists:
            if sock in sock_list:
                sock_list.remove(sock)
        sock.close()


    def handle_readable_socks(self, read_ready_socks):
        for sock in read_ready_socks:
            if sock is self.listener_sock:
                connection, base_station_addr = sock.accept()
                print(
                    f"Connected to base station with address {base_station_addr}"
                )
                # set to non-blocking reads
                connection.setblocking(0)
                self.readable_socks.append(connection)
                self.errorable_socks.append(connection)
            # If its a connection socket, receive the data from 
            else:
                data = sock.recv(1024).decode("utf-8")
                print(f"Data {data}")
                # if the socket receives "", it means the socket was closed
                # from the other end, so close this endpoint too
                if not data:
                    self.close_sock(sock)
                Minibot.parse_command(data)
                # TODO need to write back saying that the command executed
                # successfully
    
    def handle_writable_socks(self, write_ready_socks):
        for sock in write_ready_socks:
            pass
    
    def handle_errorable_socks(self, errored_out_socks):
        for sock in errored_out_socks:
            self.close_sock(sock)

    def main(self):
        # Note: sock stands for socket
        self.create_listener_sock()
        # Add listener sock to input_socks so that we are alerted if any connections
        # are trying to be created and add listener sock to errorable_socks so that 
        # we are alerted if an error gets thrown by this listener sock.  No need to 
        # add the listener sock to writable socks because we won't be writing to 
        # this socket, only listening.
        self.readable_socks.append(self.listener_sock)
        self.errorable_socks.append(self.listener_sock)
        while True:
            if len(self.readable_socks) == 1:
                self.broadcast_to_base_station()
            # select returns the list of sockets that are read ready, write ready,
            # or have thrown an error as soon as it detects some activity on any
            # of these sockets
            read_ready_socks, write_ready_socks, errored_out_socks = select(
                self.readable_socks, self.writable_socks, self.errorable_socks, 1
            )
            self.handle_readable_socks(read_ready_socks)
            self.handle_writable_socks(write_ready_socks)
            self.handle_errorable_socks(errored_out_socks)


if __name__ == "__main__":
    minibot = Minibot()
    minibot.main()
