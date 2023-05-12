"""
Use this file to experiment with SPI.
The boilerplate is set up for you.
"""

import binascii
import spidev
import time
from message_utils import *

spi = spidev.SpiDev()
bus = 0
device = 0
spi.open(bus,device)
spi.mode = 0
spi.max_speed_hz = 115200

#############################################################
# Write your code here...

init_msg = "Well Played!"
byte_msg = make_crc_message(init_msg)
send_message(spi, byte_msg)


#############################################################
# Do not write anything below this line
spi.close()
