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

        self.test_movement()
        self.test_error_messages()
        self.test_mode()
        self.test_ports()
        self.test_connectivity()

        self.spawn.terminate()

    def spawn_minibot(self):
        self.spawn = subprocess.Popen(
            args=["python3", "minibot.py", "-t"], stdout=subprocess.PIPE, universal_newlines=True)

    def test_movement(self):
        """ Tests minibot movement
        """

        print("Testing forward movement")
        self.send_movement("forward")
        assert self.check_for_minibot_output("F\n")
        print("Foward test passed!\n")

        print("Testing backward movement")
        self.send_movement("backward")
        assert self.check_for_minibot_output("B\n")
        print("Backward test passed!\n")

        print("Testing left movement")
        self.send_movement("left")
        assert self.check_for_minibot_output("L\n")
        print("Left test passed!\n")

        print("Testing right movement")
        self.send_movement("right")
        assert self.check_for_minibot_output("R\n")
        print("Right test passed!\n")

        print("Testing stop movement")
        self.send_movement("stop")
        assert self.check_for_minibot_output("S\n")
        print("Stop test passed!\n")

    def test_error_messages(self):
        print("Testing error message when pr('test') is run")
        self.send_program('pr("test")\n')
        error_msg = "<class 'NameError'>: name 'pr' is not defined"
        time.sleep(1)
        self.send_script_exec_result()
        assert self.check_script_exec_result(error_msg)
        print("Error message test passed!\n")

    def test_mode(self):
        print("Testing object detection mode")
        self.send_mode("object_detection")
        assert self.check_for_minibot_output("O\n")
        print("Object detection test passed!\n")

        print("Testing line follow mode")
        self.send_mode("line_follow")
        assert self.check_for_minibot_output("T\n")
        print("Line follow test passed!\n")

    def test_ports(self):
        print("Testing setting a Left Motor to Port 2")
        self.send_ports("LMOTOR 2")
        assert self.check_for_minibot_output("2\n")
        print("Ports test passed!\n")
    
    def test_connectivity(self):
        """ Tests whatever 
        """
        for _ in range(5):
            self.send_botstatus()
            assert self.check_botstatus()
        print("Finished sending botstatus!!!!")

        # stop sending botstatus to minibot for 5 seconds -> Minibot should disconnect
        time.sleep(5)
        assert self.check_for_minibot_output("Basestation Disconnected\n")
        print("Basestation disconnected")

        # check for reconnection
        self.connect_to_minibot()
        self.send_botstatus()
        assert self.check_botstatus()
        print("Minibot reconnected!")

        print("Connectivity test passed!")

    def check_for_minibot_output(self, string):
        start_time = time.time()
        while (output := self.spawn.stdout.readline()) != string:
            if time.time() - start_time > 5:
                return False
            # print(output)
        return True

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

    def send_botstatus(self):
        self.conn_sock.sendall("<<<<BOTSTATUS,>>>>".encode())

    def check_botstatus(self):
        key, value = self.readKV()
        return key == "BOTSTATUS" and value == "ACTIVE"

    def send_movement(self, direction):
        self.conn_sock.sendall(f"<<<<WHEELS,{direction}>>>>".encode())

    def send_mode(self, mode):
        self.conn_sock.sendall(f"<<<<MODE,{mode}>>>>".encode())

    def send_ports(self, ports):
        self.conn_sock.sendall(f"<<<<PORTS,{ports}>>>>".encode())

    def send_program(self, program):
        self.conn_sock.sendall(f"<<<<SCRIPTS,{program}>>>>".encode())

    def send_script_exec_result(self):
        self.conn_sock.sendall("<<<<SCRIPT_EXEC_RESULT,>>>>".encode())

    def check_script_exec_result(self, error_msg):
        key, value = self.readKV()
        return key == "SCRIPT_EXEC_RESULT" and value == error_msg

    def readKV(self):
        data_bytes = self.conn_sock.recv(TestMinibot.SOCKET_BUFFER_SIZE)
        data = data_bytes.decode('UTF-8')
        comma = data.find(",")
        start = data.find(TestMinibot.START_CMD_TOKEN)
        end = data.find(TestMinibot.END_CMD_TOKEN)

        token_len = len(TestMinibot.START_CMD_TOKEN)
        key = data[start + token_len:comma]
        value = data[comma + 1:end]
        return key, value


if __name__ == "__main__":
    test_minibot = TestMinibot()
    test_minibot.run()
