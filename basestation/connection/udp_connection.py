from util.exception_handling import *

import threading
import time
import socket


class UDPConnection(threading.Thread):
    """
    UDPConnection's instances can be used to track devices that are
    broadcasting on a certain internally-set port. Can be used to discover
    MiniBots that are currently actively broadcasting signals through UDP.
    """

    def __init__(self):
        """
        Initializes the UDP connection socket.
        """
        super().__init__()
        # the time (sec) before an address is removed from our list
        self.__update_threshold = 40
        self.__port = 5001
        self.__IP_list = {}
        self.__listener_socket = socket.socket(socket.AF_INET,
                                               socket.SOCK_DGRAM)
        self.__listener_socket.bind(("", self.__port))
        return

    def get_addresses(self) -> list:
        """
        Returns:
            (list): The list of IPs that have been discovered and are
                currently active.
        """

        self.__clean_addresses()
        return sorted(self.__IP_list.keys())

    def set_address_inactive(self, ip):
        """
        Sets address to be active True or False
        """
        last_updated_time, active =  self.__IP_list[ip]
        self.__IP_list[ip] = (last_updated_time, False)

    def is_address_active(self, ip):
        """
        Returns:
            (bool): True if the address is active.
        """
        last_updated_time, active = self.__IP_list[ip]
        return active

    def run(self):
        """
        Runs the UDP Listener, and adds the IPs of the devices that are
        broadcasting.
        """
        try:
            while True:
                data = self.__listener_socket.recvfrom(512)
                device_address = data[1][0]
                self.__IP_list[device_address] = (self.__get_current_time(), True)

        except socket.error as e:
            msg = "Unable to receive broadcasts sent to the port " + \
                  str(self.__port) + "."
            log_exn_info(e, msg)

        return

    def __clean_addresses(self):
        """
        Filters the IPs in the internal map that have been inactive (not
        broadcasting) for time = `self.__update_threshold`.
        """

        now = self.__get_current_time()
        new_IP_list = {}

        for address, val in self.__IP_list.items():
            last_updated_time, active = val
            if now - last_updated_time <= float(self.__update_threshold):
                new_IP_list[address] = (last_updated_time, active)

        self.__IP_list = new_IP_list
        return

    @staticmethod
    def __get_current_time():
        """
        Returns:
            (float): Current time in seconds, since the start of epoch.
        """
        return time.time()
