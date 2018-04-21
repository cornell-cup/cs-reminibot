# UDP code taken from < https://pymotw.com/2/socket/udp.html >

import socket, time, fcntl, struct

def udpBeacon():
	# Create a UDP socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    my_ip = getIP('wlan0')
    spliced_subnet = my_ip[:my_ip.rfind('.')] + ".255"

        # Define broadcasting address and message
    server_address = (spliced_subnet, 5001)
    message = 'Hello, I am a minibot!'
        
        # Send message and resend every 9 seconds
    while True:
        try:
		    # Send data
            print('sending broadcast: "%s"' % message)
            sent = sock.sendto(bytes(message, 'utf8'), server_address)
        except Exception as err:
            print(err)
        time.sleep(9)

def getIP(ifname):
    """
    Returns the IP of the device
    """
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
        s.fileno(),
        0x8915,  # SIOCGIFADDR
        struct.pack('256s', bytes(ifname[:15],'utf8'))
        )[20:24])

