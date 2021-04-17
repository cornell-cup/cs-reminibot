import binascii
import spidev
import time
from message_utils import make_message, send_message

print("Setting up SPI")
spi = spidev.SpiDev()
bus = 0
device = 0
spi.open(bus,device)
spi.mode = 0
spi.max_speed_hz = 115200

def validator(msg):
    return "".join([chr(x) for x in msg]) == "ABCDEFGHIJKLMNOP"
    # return msg[0] == ord('C') and msg[1] == ord('C') and \
    # msg[-1] == ord('T') and msg[-2] == ord('R')

def read_data(spi, msg, nbytes, validator, max_tries=100, expected=None):
    """
    Reads data from the secondary device over SPI.

    Args:
        spi: The SPI object from spidev, with preset properties
                i.e. open bus/device, mode, max speed, etc.
        msg: The message to send as a list of ASCII numbers, including
                any non-payload bytes. Use this to request some data
                to be loaded for reading.
        nbytes: The number of bytes to read.
        validator: function from list of bytes -> [true, false]
                    Used to determine if data is valid or not
        max_tries:  The maximum number of tries to send the message
                    before giving up
    """
    lod_msg = msg.copy()
    print("Send load req msg")
    send_message(spi, lod_msg) # request data load
    buf = [0] * nbytes
    done = False
    data = []
    numTries = 0
    while not done and numTries < max_tries:
        # Send empty buffer (to read)
        print("Sent {}: {} | {}".format(len(buf), "".join([chr(c) for c in buf]), buf))
        spi.xfer(buf)
        numTries += 1
        # Validate data
        print("Received {}: {} | {}".format(len(buf), "".join([chr(c) for c in buf]), buf))
        if validator(buf):
            print("Data OK")
            data = buf.copy()
            if expected is not None:
                assert "".join([chr(x) for x in data]) == expected
            done = True
        else:
            # Ask to resend
            print("Send load req msg")
            send_message(spi,lod_msg)
    print("Read {} in {} tries".format(buf, numTries))
    return data, numTries

ntries_list = []
nbytes = 16 # Configure # of bytes to read here
start_time = time.time()

for _ in range(100):
    data, numTries = read_data(spi, make_message("RED"), nbytes, validator, max_tries=100)
    ntries_list.append(numTries)
end_time = time.time()

print("Received {} | {}".format(data, "".join([chr(x) for x in data])))
print(f"nTries: {ntries_list}")
print(f"Total tries: {sum(ntries_list)}")
print(f"Total time: {end_time - start_time} sec")
print(f"Bytes / sec: {nbytes * sum(ntries_list) / (end_time - start_time)}")

spi.close()