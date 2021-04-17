import binascii
import spidev
import time
import threading
from statistics import median
from message_utils import send_message

spi = spidev.SpiDev()
bus = 0
device = 0
spi.open(bus,device)
spi.mode = 0b00
spi.max_speed_hz = 115200

ENQ = 5 # ENQ
ACK = 6

def send_msg(msg):
    done = False
    numTries = 0
    buf = msg.copy()
    sum_ntries = 0
    start_time = time.time()
    tries_list = []
    for _ in range(100):
        while not done and numTries < 100:
            # Send the message
            # print("Sending: {}".format(buf))
            spi.xfer(buf)
            # print("Arduino Echo (should be offset): {}".format(buf))
            numTries += 1
            # Request status
            buf = [5]
            spi.xfer(buf)
            # print("Arduino Status: {}".format(buf))
            # Check if anything broke
            for i in buf:
                if i == ACK:
                    done = True
                    break
            buf = msg.copy()
        # print("Sent {} in {} tries".format(msg, numTries))
        tries_list.append(numTries)
        done = False
        sum_ntries += numTries
        numTries = 0
    end_time = time.time()
    diff_ms = end_time - start_time
    print(f"Total tries: {sum_ntries}")
    print(f"Tries list: {tries_list}")
    print(f"Total time (s): {diff_ms}")
    print(f"Messages per second: {sum_ntries / diff_ms}")

if __name__ == "__main__":
    send_msg([ord(c) for c in "CCOMGRT"])