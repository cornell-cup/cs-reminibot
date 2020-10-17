import socket
import time

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
address = ("", 9434)
sock.bind(address)
response = "i_am_the_base_station"
# a minibot should send this message in order to receive the ip_address
request_password = "i_am_a_minibot"

while True:
    buffer_size = 4096
    data, minibot_address = sock.recvfrom(buffer_size)
    data = str(data.decode('UTF-8'))

    if data == request_password:
        # Tell the minibot that you are the base station
        sock.sendto(response.encode(), minibot_address)
        break
s = socket.create_connection((minibot_address[0], 10000))
s.sendall("<<<<WHEELS,forward>>>>".encode())
time.sleep(2)
s.sendall("<<<<WHEELS,stop>>>>".encode())

