from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    Thread(target=fwd, args=[10]).start()
    time.sleep(1)
    Thread(target=stop, args=[]).start()
    
