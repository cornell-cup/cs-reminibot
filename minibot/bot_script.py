from scripts.PiArduino import *
import time
from threading import *
def run():
    if 0 < read_ultrasonic() <= 10:
      Thread(target=fwd, args=[100]).start()
      time.sleep(2)
      Thread(target=stop, args=[]).start()
run()    
