"""
Imagine you need to receive sensor data from the Arduino.

Here's an example of how you might do that...
"""

import binascii
import spidev
import time
from message_utils import *

# Set up SPI instance
spi = spidev.SpiDev()
bus = 0
device = 0
spi.open(bus, device)
spi.mode = 0
spi.max_speed_hz = 115200

# To load something, build a request for it
# This assumes the arduino knows to load item 4
# This is arbitrary, but I set 4 to correspond to
# a photoresistor wired to the Arduino itself.
load_req = [ord('R'), ord('F'), ord('I'), ord('D'), 4]
load_msg = make_crc_message(load_req)

# Then, make the request for 22 bytes
# (i.e. 2 start chars + 2 crc16 chars + 16 data bytes + 2 end chars)
data = read_data(spi, load_msg, 22, validate_crc_message)

# Then remove the start, end, and checksum to get your data
data = unpack_crc_message(data)
print(f"Your data: {data}")

# What you do with that data afterwards is up to you...
# I know the photoresistor returns an integer, so I parse it
# and print it.
sensor_val = int.from_bytes(bytes(data[0:4]), 'big', signed=True)
print(f"Sensor reads: {sensor_val}")

# It's usually a good idea to send processed data to the base station.
