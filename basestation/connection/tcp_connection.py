"""
TCP Connection.

This is imported from cs-minibot.
"""

from util.thread_synchronization import *
from util.exception_handling import *

import socket

class TCPConnection(object):

    def __init__(self, ip, port=10000):
        """
        Initialize a TCP connection between this device and the the
        device identified by IP on the local network at port.

        Args:
            ip (str): The IP of the device to be connected with this device.
            port (int, optional): The port of the connection. Default = 10000.
        """
        self.__IP = ip
        self.__port = port
        try:
            self.__client_socket = socket.create_connection((self.__IP,
                                                             self.__port))
            self.__connection_refused = False

        except socket.error as e:
            msg = "Unable to establish TCP Connection with " + self.__IP + "."
            log_exn_info(e, msg=msg)
            self.__connection_refused = True
            self.destroy()

        return

    def is_connection_active(self):
        """
        Returns:
            (bool): True if the TCP connection between this device and the
                device with `IP == getIP()` is active
        """
        try:
            self.__client_socket.send("testing connection".encode())
            return True
        except Exception as e:
            self.__client_socket.close()
            return False

    def getIP(self):
        """
        Returns:
            (str): IP of the device that is connected through TCP. Active
                connection is not guaranteed - check `is_connection_active()`.
        """
        return self.__IP

    def destroy(self):
        try:
            # stop receiving from the pi server
            self.__client_socket.shutdown(socket.SHUT_RD)
            self.__client_socket.close()
            self.__connection_refused = True

        except socket.error as e:
            msg = "Could not destroy the connection with " + self.__IP + "."
            log_exn_info(e, msg=msg)

        return False

    @synchronized
    def sendKV(self, key, value):
        """
        Sends a message to the device with `IP == getIP()` using the established
        TCP connection. The message is in the form of key, value that is
        identifiable by the device on the other end.

        Args:
            key (str): Key of the message. Typically a message that can help
                distinguish between different types of messages.
            value (str): Value/object that qualifies the key in the message.

        Returns:
            (bool): True if the message was sent successfully. False otherwise.
        """
        payload = "<<<<" + key + "," + value + ">>>>"
        try:
            self.__client_socket.send(payload.encode())
            return True

        except socket.error as e:
            msg = "Unable to send the message \"" + key + "," + value + "\" " \
                "to " + self.__IP + "."
            log_exn_info(e, msg=msg)
            return False

    def receive(self):
        """
        Receives data from the device at `IP == getIP()`.

        Returns:
            (Optional[str]): Returns a string representing the data received.
                Returns None if receive failed.
        """
        try:
            print("I received!")
            return self.__client_socket.recv(1024).decode()

        except socket.error as e:
            msg = "Unable to receive from " + self.__IP + "."
            log_exn_info(e, msg=msg)
            self.__connection_refused = True
            return None
