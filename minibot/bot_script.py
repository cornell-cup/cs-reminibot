from scripts.PiArduino import *
import time
from threading import *
def run():
    for count in range(5):
      time.sleep(3)
      Thread(target=stop, args=[]).start()
      if 0 < read_ultrasonic() <= 10:
        move_servo(90)
      else:
        move_servo(0)

run()
    