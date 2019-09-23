from hardware.communication.TCP import TCP

from socket import *
from threading import Thread
import fcntl
import struct
import sys
import time

# Create a UDP socket
sock = socket(AF_INET, SOCK_DGRAM)
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

server_address = ('255.255.255.255', 9434)
message = 'i_am_a_minibot'


def start_base_station_communication(ip_address):
    # Define broadcasting address and message
    server_address = (ip_address, 5001)
    message = 'Hello, I am a minibot!'
        
        # Send message and resend every 9 seconds
    while True:
        try:
		    # Send data
            print('sending broadcast: "%s"' % message)
            sent = sock.sendto(message.encode(), server_address)
        except Exception as err:
            print(err)
        time.sleep(9)


try:
    server_ip = None
    while True:
        # Send data
        print('sending: ' + message)
	sent = sock.sendto(message.encode(), server_address)

	# Receive response
	print('waiting to receive')
	data, server = sock.recvfrom(4096)
	if data.decode('UTF-8') == 'i_am_the_base_station':
            print('Received confirmation')
            server_ip = str(server[0])
            print('Server ip: ' + server_ip)
            break
	else:
	    print('Verification failed')
	    print('Trying again...')

    base_station_thread = Thread(target=start_base_station_communication, args=(server_ip,)) 
    base_station_thread.start()
    tcp_instance = TCP()
    while True:
        tcp_cmd = tcp_instance.get_command()
        parse_command(tcp_cmd, bot, tcp_instance)
        time.sleep(0.01)
	
	
finally:	
    sock.close()


