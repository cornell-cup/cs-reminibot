from scripts.PiArduino import *
import time
def run():
    for count in range(2):
      fwd(0)
      time.sleep(1)
      right(0)
      time.sleep(1)
      left(0)
      time.sleep(1)
    stop()
    
