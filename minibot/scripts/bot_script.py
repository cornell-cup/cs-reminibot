from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    for count in range(5):
      time.sleep(5)
      Thread(target=stop, args=[]).start()
      if 0 < read_ultrasonic() <= 20:
        move_servo(360)
      else:
        move_servo(180)
    
