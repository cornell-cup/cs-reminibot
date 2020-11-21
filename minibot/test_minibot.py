import socket
import time
import subprocess
from subprocess import Popen


class TestMinibot:

    SOCKET_BUFFER_SIZE = 1024
    START_CMD_TOKEN = "<<<<"
    END_CMD_TOKEN = ">>>>"

    def __init__(self):
        self.conn_sock = None
        self.spawn = None

    def run(self):
        self.spawn_minibot()
        self.connect_to_minibot()
        # sending commands over TCP

        self.test_connectivity()
        # time.sleep(10)

        self.spawn.terminate()

    def spawn_minibot(self):
        self.spawn = subprocess.Popen(
            args=["python3 minibot.py -t"], shell=True, universal_newlines=True)

    def test_connectivity(self):
        # checking bot status
        self.send_botstatus(5)
        print("Finished sending botstatus!!!!")
        time.sleep(5)
        output = self.spawn.communicate(timeout=1)
        print(output)

        # time.sleep(10)
        # print("spawn readline " + output)

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
            if self.check_botstatus():
                print("botstatus is active")
            else:
                print("botstatus is inactive")

    def check_botstatus(self):
        data_bytes = self.conn_sock.recv(TestMinibot.SOCKET_BUFFER_SIZE)
        data = data_bytes.decode('UTF-8')
        comma = data.find(",")
        start = data.find(TestMinibot.START_CMD_TOKEN)
        end = data.find(TestMinibot.END_CMD_TOKEN)

        token_len = len(TestMinibot.START_CMD_TOKEN)
        key = data[start + token_len:comma]
        value = data[comma + 1:end]

        return key == "BOTSTATUS" and value == "ACTIVE"


if __name__ == "__main__":
    test_minibot = TestMinibot()
    test_minibot.run()
