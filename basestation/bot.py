import socket
import time
from typing import Optional


class Bot:
    """ Represents a Minibot that the Basestation is connected to, it is a 
    Minibot interface that the basestation can interact with.  This class 
    handles all socket communication with the Minibot
    """
    SOCKET_BUFFER_SIZE = 1024
    START_CMD_TOKEN = "<<<<"
    END_CMD_TOKEN = ">>>>"
    TIMEOUT_LIMIT = 10

    def __init__(self, bot_id, bot_name, ip_address, port=10000):
        self.port = port
        self.ip_address = ip_address
        # the basestation's endpoint socket with the
        self.sock = socket.create_connection((ip_address, port))
        # an arbitrarily small time
        self.sock.settimeout(0.01)
        self._name = bot_name
        self._id = bot_id
        self.last_status_time = time.time()
        self.is_socket_connected = True

    def try_receive_data(self, peek: bool = False) -> Optional[str]:
        """ Tries to receive data from the Minibot. 

        Arguments:
            peek:  Whether to empty the socket buffer.  If False empty buffer,
                if True, do not. 
        Returns:  The data, or None if the socket is disconnected 
        """
        line = ""
        try:
            if peek:
                data = self.sock.recv(Bot.SOCKET_BUFFER_SIZE, socket.MSG_PEEK)
            else:
                data = self.sock.recv(Bot.SOCKET_BUFFER_SIZE)
            line = data.decode("utf-8")
            line = line if len(line) > 0 else None # if "" then line = None
            if line is None:
                self.sock.close()
                self.is_socket_connected = False
        except socket.timeout:
            pass
        except ConnectionResetError:
            print("Connection Reset Error")
            line = None
            self.is_socket_connected = False
        return line

    def sendKV(self, key, value):
        """
        send command with specified key and value
        """
        if not self.is_socket_connected:
            return

        data = f"<<<<{key},{value}>>>>".encode()
        line = self.try_receive_data(peek=True)
        # print(f"Line {line}")
        # print(f"Data {data}")
        if line is not None:
            self.sock.sendall(data)

    def readKV(self):
        """
        Reads from the socket connection between the basesation and the Minibot
        <<<<BOTSTATUS,ACTIVE>>>>
        """
        if not self.is_socket_connected:
            return
        data_str = self.try_receive_data()
        # print(f"Data str {data_str}")
        if data_str is None:
            return
        # parse the data by removing the angular brackets
        comma = data_str.find(",")
        start = data_str.find(Bot.START_CMD_TOKEN)
        end = data_str.find(Bot.END_CMD_TOKEN)

        token_len = len(Bot.START_CMD_TOKEN)
        key = data_str[start + token_len:comma]
        value = data_str[comma + 1:end]

        # checks if BOTSTATUS is ACTIVE and resets the last status time
        if key == "BOTSTATUS" and value == "ACTIVE":
            # set to current time in seconds
            self.last_status_time = time.time()

    def is_connected(self) -> bool:
        """ Checks whether the Minibot has sent a heartbeat message recently 
        """
        time_diff = time.time() - self.last_status_time
        # print(f"Time diff {time_diff}")
        return time_diff < Bot.TIMEOUT_LIMIT and self.is_socket_connected

    @property
    def name(self):
        return self._name

    @property
    def id(self):
        return self._id
