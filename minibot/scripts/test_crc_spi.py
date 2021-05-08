import binascii
import spidev
import time
from message_utils import *
from crc import crc16

# Set up SPI stuff
print("Setting up SPI")
spi = spidev.SpiDev()
bus = 0
device = 0
spi.open(bus,device)
spi.mode = 0
spi.max_speed_hz = 115200

msg = make_crc_message([ord(x) for x in "HELLO"])
valid = validate_crc_message(msg, 5)

print(f"Valid: {valid}")
if valid:
    data = unpack_crc_message(msg)
    print(f"Message data: {data}")