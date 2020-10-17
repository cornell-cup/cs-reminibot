import socket 

class Bot:
    """ Represents a Minibot that the Basestation is connected to, it is a 
    Minibot interface that the basestation can interact with.  This class 
    handles all socket communication with the Minibot
    """
    def __init__(self, bot_id, bot_name, ip_address, port=10000):
        self.port = port
        self.ip_address = ip_address
        # the basestation's endpoint socket with the 
        self.sock = socket.create_connection((ip_address, port))
        self._name = bot_name
        self._id = bot_id 

    def sendKV(self, key, value):
        """
        send command with specified key and value
        """
        # TODO change this protocol
        data = f"<<<<{key},{value}>>>>".encode()
        self.sock.sendall(data)
    
    @property
    def name(self):
        return self._name

    @property
    def id(self):
        return self._id