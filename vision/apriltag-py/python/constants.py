from platform import node as platform_node
from random import randint
import time

'''
File containing constants that are used in the overhead vision system
'''

VISION_FPS = 30
BLUE = (0,0,255)        # RGB color code for blue
GREEN = (0, 255, 0)     # RGB color code for green
RED = (255, 0, 0)       # RGB color code for red
MAGENTA = (255, 0, 255) # RGB color mode for magenta
CYAN = (0, 255, 255)    # RGB color mode for cyan

# Constants (from part3 of calibration)
DEVICE_ID = 1  # The device the camera is, usually 0.
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720

# Arguments
# These are effectively constant after the argument parser has ran.
TAG_SIZE = 6.5 # The length of one side of an apriltag, in inches
SEND_DATA = True  # Sends data to URL if True. Set to False for debug
MAX_LOCATION_HISTORY_LENGTH = 20
MODE_THRESHOLD = 1

# These constants are to generate a new calibration board position file
TOTAL_COLUMN_COUNT = 16
TOTAL_ROW_COUNT = 8
# total_sections = 4
COLUMN_OFFSET = 7.5
ROW_OFFSET = 7.5
COLUMNS_PER_SECTION = 4
SECTION_OFFSET = COLUMNS_PER_SECTION*COLUMN_OFFSET
# tag_id_rotation_offset = 45
OUTFILE = "calibration_board_positions.json"