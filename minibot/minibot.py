from bs_repr import BS_Repr
from collections import deque
from ctypes import c_char_p
from multiprocessing import Process, Manager, Value
from select import select
from socket import socket, timeout, AF_INET, SOCK_STREAM, SOCK_DGRAM
from socket import SOL_SOCKET, SO_REUSEADDR, SO_BROADCAST
from threading import Thread
from typing import List, Tuple
import importlib
import os
import sys
import time
import argparse
import signal



class Minibot:
    """ Represents a minibot.  Handles all communication with the basestation
    as well as executing commands sent by the basestation.

    Note: sock stands for socket throughout this file.  A socket is one endpoint
        of a communication channel. 
    """

    # address refers to ip_address and port
    BROADCAST_ADDRESS = ('255.255.255.255', 9434)
    MINIBOT_MESSAGE = "i_am_a_minibot"
    BASESTATION_MESSAGE = "i_am_the_basestation"
    # 1024 bytes
    SOCKET_BUFFER_SIZE = 1024
    START_CMD_TOKEN = "<<<<"
    END_CMD_TOKEN = ">>>>"

    def __init__(self):
        # Create a UDP socket.  We want to establish a TCP (reliable) connection
        # between the basestation and the
        self.broadcast_sock = socket(AF_INET, SOCK_DGRAM)
        # can immediately rebind if the program is killed and then restarted
        self.broadcast_sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        # can broadcast messages to all
        self.broadcast_sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)
        # listens for a TCP connection from the basestation
        self.listener_sock = None

        # Note:  The same socket can be in the readable_socks, writeable_socks
        # and errorable_socks i.e. the intersection of these lists does not need
        # to be (and will almost never be) the empty set

        # contains sockets which we are expecting to receive some data on
        self.readable_socks = set()
        # contains sockets which we want to send some data on
        self.writable_socks = set()
        # contains sockets that throw errors that we care about and want to
        # react to
        self.errorable_socks = set()
        # TODO: All message queues should have a max limit of messages that they
        # store, implement custom class at some point
        self.writable_sock_message_queue_map = {}
        self.bs_repr = None
        self.script_exec_result = None
        self.sock_lists = [
            self.readable_socks, self.writable_socks, self.errorable_socks
        ]
        signal.signal(signal.SIGINT, self.sigint_handler)

    def main(self):
        """ Implements the main activity loop for the Minibot.  This activity 
        loop continuously listens for commands from the basestation, and 
        connects/reconnects to the basestation if there is no connection.
        """
        self.create_listener_sock()
        # Add listener sock to input_socks so that we are alerted if any connections
        # are trying to be created and add listener sock to errorable_socks so that
        # we are alerted if an error gets thrown by this listener sock.  No need to
        # add the listener sock to writable socks because we won't be writing to
        # this socket, only listening.
        self.readable_socks.add(self.listener_sock)
        self.errorable_socks.add(self.listener_sock)
        while True:
            # if the listener socket is the only socket alive, we need to
            # broadcast a message to the basestation to set up a new connection
            # with us (the minibot)
            if len(self.readable_socks) == 1:
                self.broadcast_to_base_station()
            # select returns new lists of sockets that are read ready (have
            # received data), write ready (have initialized their buffers, and
            # are ready to be written to), or errored out (have thrown an error)
            # select returns as soon as it detects some activity on one or more
            # of the sockets in the lists passed to it, or if the timeout time
            # has elapsed
            read_ready_socks, write_ready_socks, errored_out_socks = select(
                self.readable_socks,
                self.writable_socks,
                self.errorable_socks,
                1,  # timeout time
            )
            # WARNING!! Be careful about closing sockets in any of these functions
            # because the local lists read_ready_socks, write_ready_socks
            # and errored_out_socks will still contain the closed socket.
            # Hence, if you do this removal, make sure the socket is removed
            # from these local lists too!!!
            self.handle_errorable_socks(errored_out_socks)
            self.handle_writable_socks(write_ready_socks)
            self.handle_readable_socks(read_ready_socks)
            # if basestation exists but is disconnected, stop minibot
            if self.bs_repr and not self.bs_repr.is_connected():
                self.basestation_disconnected(self.bs_repr.conn_sock)

    def create_listener_sock(self):
        """ Creates a socket that listens for TCP connections from the 
        basestation.
        """
        self.listener_sock = socket(AF_INET, SOCK_STREAM)
        # can immediately rebind if the program is killed and then restarted
        self.listener_sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
        # "" means bind to all addresses on this device.  Port 10000 was
        # randomly chosen as the port to bind to
        self.listener_sock.bind(("", 10000))
        # Make socket start listening
        print("Waiting for TCP connection from basestation")
        self.listener_sock.listen()

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

    def handle_readable_socks(self, read_ready_socks: List[socket]):
        """ Reads from each of the sockets that have received some data.  
        If a listener socket received data, we accept the incoming connection.
        If a connection socket received data, we parse and execute, 
        the incoming command.

        Arguments:
            read_ready_socks: All sockets that have received data and are ready
                to be read from.
        """
        for sock in read_ready_socks:
            # If its a listener socket, accept the incoming connection
            if sock is self.listener_sock:
                connection, base_station_addr = sock.accept()
                print(
                    f"Connected to base station with address {base_station_addr}"
                )
                # set to non-blocking reads (when we call connection.recv,
                # should read whatever is in its buffer and return immediately)
                connection.setblocking(0)
                # initialize basestation repr to the connection sock
                self.bs_repr = BS_Repr(connection)
                # we don't need to write anything right now, so don't add to
                # writable socks
                self.readable_socks.add(connection)
                self.errorable_socks.add(connection)
            # If its a connection socket, receive the data and execute the
            # necessary command
            else:
                try:
                    # if the socket receives "", it means the socket was closed
                    # from the other end
                    data_str = sock.recv(
                        Minibot.SOCKET_BUFFER_SIZE).decode("utf-8")
                except ConnectionResetError:
                    data_str = ""

                if data_str:
                    self.parse_and_execute_commands(sock, data_str)
                else:
                    self.basestation_disconnected(sock)
                # TODO need to write back saying that the command executed.
                # successfully

    def handle_writable_socks(self, write_ready_socks):
        """ 
        iterate through all the sockets in the write_ready_socks and 
        send over all messages in the socket's message_queue
        Arguments:
            write_ready_socks: 
                All sockets that have had data written to them
        """

        for sock in write_ready_socks:
            message_queue = self.writable_sock_message_queue_map[sock]
            all_messages = "".join(message_queue)
            sock.sendall(all_messages.encode())
            self.writable_sock_message_queue_map[sock] = deque()
            self.writable_socks.remove(sock)

    def handle_errorable_socks(self, errored_out_socks):
        """ 
        iterate through all the sockets in the errored_out_socks and 
        close these socks
        Arguments:
            errored_out_socks: 
                All sockets that have errored out
        """
        for sock in errored_out_socks:
            print(f"Socket errored out!!!! {sock}")
            # TODO handle more conditions instead of just
            self.close_sock(sock)
            # closing the socket

    def close_sock(self, sock):
        for sock_list in self.sock_lists:
            if sock in sock_list:
                sock_list.remove(sock)
        sock.close()
    
    def basestation_disconnected(self, basestation_sock):
        print("Basestation Disconnected")
        Thread(target=ece.stop).start()
        self.close_sock(basestation_sock)
        self.bs_repr = None

    def parse_and_execute_commands(self, sock: socket, data_str: str):
        """ Parses the data string into individual commands.  

        Arguments: 
            sock: The socket that we just read the command from
            data_str: The raw data that we receive from the socket.

        Example: 
            If the data_str is 
            "<<<<WHEELS,forward>>>><<<<WHEELS,backward>>>><<<<WHEELS,stop>>>>"
            the commands will be parsed and executed as:

            1. WHEELS, forward
            2. WHEELS, backward
            3. WHEELS, stop
        """
        while len(data_str) > 0:
            comma = data_str.find(",")
            start = data_str.find(Minibot.START_CMD_TOKEN)
            end = data_str.find(Minibot.END_CMD_TOKEN)

            token_len = len(Minibot.START_CMD_TOKEN)
            key = data_str[start + token_len:comma]
            value = data_str[comma + 1:end]
            # executes command with key,value
            self.execute_command(sock, key, value)
            # shrink the data_str with the remaining portion of the commands
            data_str = data_str[end + token_len:]

    def execute_command(self, sock: socket, key: str, value: str):
        """ Executes a command using the given key-value pair 

        Arguments:
                key: type of the command
                value: command to be executed
        """
        # All ECE commands need to be called under separate threads because each
        # ECE function contains an infinite loop.  This is because there was
        # data loss between the Raspberry Pi and the Arduino which is why the
        # Raspberry Pi needs to continuously repeat the command to the Arduino
        # so that some of the commands get through.  Once the data loss issue
        # is fixed, we can implement a regular solution. If we did not have the
        # threads, our code execution pointer would get stuck in the infinite loop.
        if key == "BOTSTATUS":
            # update status time of the basestation
            self.bs_repr.update_status_time()
            self.sendKV(sock, key, "ACTIVE")
        elif key == "SCRIPT_EXEC_RESULT":
            script_exec_result = (
                self.script_exec_result.value if self.script_exec_result else ""
            )
            self.sendKV(sock, key, script_exec_result) 
        elif key == "MODE":
            if value == "object_detection":
                Thread(target=ece.object_detection).start()
            elif value == "line_follow":
                Thread(target=ece.line_follow).start()
        elif key == "PORTS":
            ece.set_ports(value)
        elif key == "SCRIPTS":
            # The script is always named bot_script.py.
            if len(value) > 0:
                script_name = "bot_script.py"
                program = self.process_string(value)

                # file_dir is the path to folder this file is in
                file_dir = os.path.dirname(os.path.realpath(__file__))
                script_file = open(file_dir + "/scripts/" + script_name, 'w+')
                script_file.write(program)
                script_file.close()
                # create a shared variable of type "string" between the child
                # process and the current process
                manager = Manager()
                self.script_exec_result = manager.Value(c_char_p, "")

                # Run the Python program in a different process so that we 
                # don't need to wait for it to terminate and we can kill it
                # whenever we want.
                current_process = Process(
                    target=self.run_script, 
                    args=(script_name, self.script_exec_result)
                )
                current_process.start()
        elif key == "WHEELS":
            cmds_functions_map = {
                "forward": ece.fwd,
                "backward": ece.back,
                "left": ece.left,
                "right": ece.right,
            }
            if value in cmds_functions_map:
                # TODO use the appropriate power arg instead of 50 when that's implemented
                Thread(target=cmds_functions_map[value], args=[50]).start()
            else:
                Thread(target=ece.stop).start()
    
    def sendKV(self, sock, key, value):
        # we want to write to the socket we received data on, so add
        # it to the writable socks
        self.writable_socks.add(sock)
        message = f"<<<<{key},{value}>>>>"
        if sock in self.writable_sock_message_queue_map:
            self.writable_sock_message_queue_map[sock].append(message)
        else:
            self.writable_sock_message_queue_map[sock] = deque([message])


    @staticmethod
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

    def run_script(self, scriptname, result):
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
            result.value = "Successful execution"
        except Exception as exception:
            str_exception = str(type(exception)) + ": " + str(exception)
            result.value = str_exception

    def sigint_handler(self, sig, frame):
        print("Minibot received CTRL + C")
        self.listener_sock.close()
        self.broadcast_sock.close()
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description='Take in arguments for minibot')
    parser.add_argument('-t', action="store_true",
                        dest="is_simulation", default=False)
    args = parser.parse_args()

    if args.is_simulation:
        import scripts.ece_dummy_ops as ece
        BOT_LIB_FUNCS = "ece_dummy_ops"
    else:
        import scripts.pi_arduino as ece
        BOT_LIB_FUNCS = "pi_arduino"

    minibot = Minibot()
    minibot.main()
