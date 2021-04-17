import binascii
import spidev
import time

# Example setup code
# spi = spidev.SpiDev()
# bus = 0
# device = 0
# spi.open(bus,device)
# spi.mode = 0
# spi.max_speed_hz = 115200

ENQ = 5 # ENQ
ACK = 6

def send_message(spi, msg, max_tries=100):
    """
    Send a message until the recipient sends back an ACK over SPI.

    Args:
        spi: The SPI object from spidev, with preset properties
                i.e. open bus/device, mode, max speed, etc.
        msg: The message to send as a list of ASCII numbers, including
                any non-payload bytes
        max_tries:  The maximum number of tries to send the message
                    before giving up
    """
    done = False
    numTries = 0
    buf = msg.copy()
    while not done and numTries < max_tries:
        # Send the message
        spi.xfer(buf)
        numTries += 1
        # Request status
        buf = [5]
        spi.xfer(buf)
        # Check for ACKnowledgement
        for i in buf:
            if i == ACK:
                done = True
                break
        buf = msg.copy()
    #print("Sent {} in {} tries".format(msg, numTries))




def read_data(spi, msg, nbytes, validator, max_tries=100):
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
            done = True
        else:
            # Ask to resend
            print("Send load req msg")
            send_message(spi,lod_msg)
    print("Read {} in {} tries".format(buf, numTries))
    return data

def unpack_message(msg):
    msg = msg[2:-2]
    pi_score = int(msg[0])
    turn = "pi" if msg[1] == "<" else "arduino"  
    arduino_score = int(msg[2])
    return pi_score, turn, arduino_score

def make_message(msg):
    return [ord(c) for c in ("CC" + msg + "RT")]