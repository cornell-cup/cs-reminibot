import socket
import time

class TestMinibot:
    def __init__(self):
        self.conn_sock = None

    def run(self):
        self.connect_to_minibot()
        # sending commands over TCP
        self.send_botstatus(10)
        print("Finished sending botstatus!!!!")
        time.sleep(20)
        
    
    def connect_to_minibot(self):
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        address = ("", 9434)
        sock.bind(address)
        response = "i_am_the_base_station"
        # a minibot should send this message in order to receive the ip_address
        request_password = "i_am_a_minibot"

        # establish TCP connection with Minibot
        while True:
            buffer_size = 4096
            data, minibot_address = sock.recvfrom(buffer_size)
            data = str(data.decode('UTF-8'))

            if data == request_password:
                # Tell the minibot that you are the base station
                sock.sendto(response.encode(), minibot_address)
                break
        self.conn_sock = socket.create_connection((minibot_address[0], 10000))
    
    def send_botstatus(self, num_times):
        for _ in range(num_times):
            self.conn_sock.sendall("<<<<BOTSTATUS,>>>>".encode())
            time.sleep(0.5)



if __name__ == "__main__":
    test_minibot = TestMinibot()
    test_minibot.run()