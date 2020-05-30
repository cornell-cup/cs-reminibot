from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    if 0 < read_ultrasonic() <= 50:
      move_servo(360)
    
