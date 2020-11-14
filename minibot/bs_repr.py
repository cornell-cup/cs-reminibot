from collections import deque
from socket import socket
import time

class BS_Repr:
    """ Represents a basestation that the Minibot is communicating with 
    """
    TIMEOUT_LIMIT = 5

    def __init__(self, conn_sock: socket):
        self.last_status_time = time.time()
        self.conn_sock = conn_sock

    def update_status_time(self):
      self.last_status_time = time.time()

    def is_connected(self) -> bool:
        """ Checks whether the Basestation has sent a heartbeat message recently 
        """
        time_diff = time.time() - self.last_status_time
        # print(f"Time diff {time_diff}")
        return time_diff < BS_Repr.TIMEOUT_LIMIT


        