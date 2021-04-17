import binascii
import spidev
import time
from message_utils import send_message, read_data, make_message

print("Setting up SPI")
spi = spidev.SpiDev()
print(spi.cshigh)
bus = 0
device = 0
spi.open(bus,device)
spi.mode = 0
spi.max_speed_hz = 115200

# done = False
# for count in range(1,10000):
#     msg = [ord(x) for x in "HELLO"]
#     spi.xfer(msg)

def validator(msg):
    return msg[0] == ord('C') and msg[3] == ord('T')

data = read_data(spi, make_message("RED"), 4, validator, max_tries=100)

spi.close()