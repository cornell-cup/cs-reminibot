import socket 
import time

class Bot:
    """ Represents a Minibot that the Basestation is connected to, it is a 
    Minibot interface that the basestation can interact with.  This class 
    handles all socket communication with the Minibot
    """
    SOCKET_BUFFER_SIZE = 1024
    START_CMD_TOKEN = "<<<<"
    END_CMD_TOKEN = ">>>>"
    TIMEOUT_LIMIT = 2

    def __init__(self, bot_id, bot_name, ip_address, port=10000):
        self.port = port
        self.ip_address = ip_address
        # the basestation's endpoint socket with the 
        self.sock = socket.create_connection((ip_address, port))
        self._name = bot_name
        self._id = bot_id
        self.last_status_time = time.time()

    def sendKV(self, key, value):
        """
        send command with specified key and value
        """
        # TODO change this protocol
        data = f"<<<<{key},{value}>>>>".encode()
        self.sock.sendall(data)
    
    def readKV(self):
        """
        Reads from the socket connection between the basesation and the Minibot
        <<<<BOTSTATUS,ACTIVE>>>>
        """
        data_str = self.sock.recv(Bot.SOCKET_BUFFER_SIZE).decode("utf-8")
        
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
        return time_diff < Bot.TIMEOUT_LIMIT
   
    @property
    def name(self):
        return self._name

    @property
    def id(self):
        return self._id