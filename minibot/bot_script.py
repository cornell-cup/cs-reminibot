from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    for count in range(1):
      # time.sleep(5)
      # Thread(target=stop, args=[]).start()
      if 0 < read_ultrasonic() <= 10:
        # move_servo(90)
        pass
      else:
        # move_servo(0)
        pass

run()
    
