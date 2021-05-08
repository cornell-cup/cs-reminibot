import binascii
import spidev
import time
from crc import crc16
# Example setup code
# spi = spidev.SpiDev()
# bus = 0
# device = 0
# spi.open(bus,device)
# spi.mode = 0
# spi.max_speed_hz = 115200

ENQ = 5 # ENQ
ACK = 6
DATA_LEN = 16 # Number of data (i.e. non-validation) bytes in all messages

def send_message(spi, msg, max_tries=100):
    """
    Send a message until the recipient sends back an ACK over SPI.

    Args:
        spi: The SPI object from spidev, with preset properties
                i.e. open bus/device, mode, max speed, etc.
        msg: The message to send as a list of ASCII numbers, including
                any non-payload bytes. Pads to 16 bytes.
        max_tries:  The maximum number of tries to send the message
                    before giving up
    """
    done = False
    numTries = 0
    if type(msg) == bytes:
        msg = list(msg)
        print(msg)
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
        nbytes: The number of bytes to read, including any validation
                bytes, start chars, end chars, checksums, etc.
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


def make_crc_message(data):
    """
    Makes a sendable message from some data.

    Args:
        data: A list of integers or a string to send.
                Must be smaller than 16 bytes long
                (i.e. all ints must be smaller than 256)
    """
    if len(data) > DATA_LEN:
        # This is changeable to fit future needs
        raise ValueError(f"Messages can be up to {DATA_LEN} bytes.")
    if type(data) == type("STRING"):
        data = [ord(d) for d in data]
    while len(data) < DATA_LEN:
        data.append(0)
    start = bytes([ord(x) for x in "CC"])
    data_hash = crc16(data)
    print(data_hash)
    data_hash_bytes = data_hash.to_bytes(2, "big") #2-byte CRC
    end = bytes([ord(x) for x in "RT"])

    return start + data_hash_bytes + bytes(data) + end

# Validate whether a message is complete
def validate_crc_message(msg, data_len=DATA_LEN):
    """
    Validate whether a received message is complete.

    args:
        msg: The message (as a list of bytes)
        data_len: The length of the data bytes, not including
                    the 2 start chars, 2 end chars, and checksum
    """
    start_ok = (msg[0] == ord('C') and msg[1] == ord('C'))
    end_ok = (msg[-2] == ord('R') and msg[-1] == ord('T'))
    data_hash = crc16(msg[4:4+data_len])
    msg_hash = int.from_bytes(msg[2:4], byteorder='big') # bytes 2 and 3
    hash_ok = (data_hash == msg_hash)
    
    return start_ok and end_ok and hash_ok

def unpack_crc_message(msg):
    return msg[4:-2]
    
