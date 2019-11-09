from scripts.ece_dummy_ops import *
import time
from threading import *
def run():
    Thread(target=fwd, args=[10]).start()
    Thread(target=stop, args=[]).start()
    
