from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    if 0 < read_ultrasonic() <= 20:
      Thread(target=fwd, args=[100]).start()
      time.sleep(1)
      Thread(target=stop, args=[]).start()
    
