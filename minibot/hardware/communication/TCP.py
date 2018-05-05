#!/usr/bin/python
from socket import *
import multiprocessing, time, signal, os, sys, threading, socket
from threading import Thread


PORT = 10000
IP = ""

class TCP(object):

    tcp = None

    def __init__(self):
        self.server_socket = socket.socket(AF_INET, SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind( (IP, PORT) )
        self.server_socket.listen(1)
        self.thread_tcp = Thread(target = self.run)
        self.thread_tcp.start()
        self.command = ""
        self.active = False
        TCP.tcp = self
        
    def isConnected(self):
        """
        :return true if connection is active
        """
        return self.active

    def set_command(self, command):
        self.command = command

    def get_command(self):
        temp = self.command
        self.command = ""
        return temp

    def send_to_basestation(self, key, value):
        """
        Sends information back to the basestation. can only execute if the
        connection is active
        """
        if self.active:
            # connection is active, send
            try:
                message = "<<<<" + key + "," + value + ">>>>"
                # appending \n to the message as java reader socket blocks until new line is encountered
                self.connectionSocket.send(message + "\n")
            except socket.error as e:
                print("Send failed")
        else:
            print("Send failed")

    def run(self):
        while TCP.tcp is None:
            time.sleep(1)
        while True:
            print("Waiting for connection")
            self.connectionSocket, self.addr = self.server_socket.accept()
            self.connectionSocket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            print("Connection accepted")
            self.active=True
            while self.active:
                command = ""
                while self.active:
                    try:
                        lastLen = len(command)
                        command += self.connectionSocket.recv(1024).decode()
                        if lastLen == len(command):
                            print("Connection Lost")
                            self.active = False
                            lastLen = -1
                            break
                    except socket.error as e:
                        print("Connection Lost")
                        self.active = False
                        break
                    end_index = command.find(">>>>")
                    # In case of command overload
                    while end_index > 0:
                        self.set_command(command[0:end_index+4])
                        command = command[end_index+4:]
                        end_index = command.find(">>>>")