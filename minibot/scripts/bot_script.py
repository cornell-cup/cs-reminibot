from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    for count in range(2):
      Thread(target=right, args=[0]).start()
      Thread(target=fwd, args=[0]).start()
      time.sleep(0)
      Thread(target=stop, args=[]).start()
    
