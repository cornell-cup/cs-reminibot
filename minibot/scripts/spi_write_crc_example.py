"""
Imagine you need to send a multi-parameter command to the minibot
e.g. "Move motor 1 forwards at 70% power for 5 seconds.

Here's an example of how you might do that...
"""

import binascii
import spidev
import time
from message_utils import *

# Set up an SPI instance
spi = spidev.SpiDev()
bus = 0
device = 1
spi.open(bus,device)
spi.mode = 0
spi.max_speed_hz = 115200

# Imagine that the arduino can recognize key-value pairs to do something
# M:1 means motor 1
# D:F means forwards
# P:70 means 70% power
# T:5 means 5 seconds

# You might encode this as a list:
data = [ord('R'), ord('F'), ord('I'), ord('D'), 4]

# Then, you'll have to send the data over
msg = make_crc_message(data)
send_message(spi, msg)

# ...and when it arrives at the Arduino, it should know what to do.
# Note that both must agree on the length of the message before
# anything is ever sent.