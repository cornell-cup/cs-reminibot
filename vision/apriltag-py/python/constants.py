from platform import node as platform_node
from random import randint
import time

'''
File containing constants that are used in the overhead vision system
'''

BLUE = (0,0,255)    # RGB color code for blue
GREEN = (0, 255, 0) # RGB color code for green
RED = (255, 0, 0)   # RGB color code for red

# Constants (from part3 of calibration)
DEVICE_ID = 0  # The device the camera is, usually 0.
# Arguments
# These are effectively constant after the argument parser has ran.
TAG_SIZE = 6.5 # The length of one side of an apriltag, in inches
SEND_DATA = True  # Sends data to URL if True. Set to False for debug
MAX_LOCATION_HISTORY_LENGTH = 20

