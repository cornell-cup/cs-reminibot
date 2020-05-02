from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    if 0 < bot.read_ultrasonic() <= 1:
      Thread(target=fwd, args=[100]).start()
      time.sleep(2)
      Thread(target=stop, args=[]).start()
    
