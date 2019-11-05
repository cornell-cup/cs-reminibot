import binascii
import spidev
import time

spi = spidev.SpiDev()

#set which arduino to talk to. slave(0) for arduino 1 and slave(1) for arduino 2
def setSlave(PiBus):
  device = 0
  bus = PiBus
  spi.open(device,bus)
  spi.mode = 0
  spi.max_speed_hz = 115200

def transmit(message):  
  try:
   # while True:
     print (message)
     tx = spi.writebytes([message])
   #  time.sleep(10)
   #   rx = spi.readbytes(2)
   #   print('Read: 0x(0)'.format(binascii.hexlify(bytearray(rx))))
  finally:
    spi.close()


def fwd(power):
  setSlave(1)
  cmd = ord('F')
  #print b
  print(cmd)
  transmit(cmd)
  #cmd = ord(param) -- do some math on the param to separate different speeds. 
  #Maybe >100 one speed <100 another set speed
  
def back(power):
  setSlave(1)
  cmd = ord('B')
  #print b
  print(cmd)
  transmit(cmd)          

def left(power):
  setSlave(1)
  cmd = ord('L')
  #print b
  print(cmd)
  transmit(cmd) 
          
def right(power):
  setSlave(1)
  cmd = ord('R')
  #print b
  print(cmd)
  transmit(cmd)     

def stop():
  setSlave(1)
  cmd = ord('S')
  #print b
  print(cmd)
  transmit(cmd)       

def LineFollow():
  setSlave(1)
  cmd = ord('T') #for tape follow
  #print b
  print(cmd)
  transmit(cmd)

def ObjectDetection():
  setSlave(0)
  cmd = ord('O') 
  #print b
  print(cmd)
  transmit(cmd)            
                  
=======
import threading

spi = spidev.SpiDev()


class TransmitLock():
    """ Class to handle locking amongst movement threads.
    self.is_transmitting = 0 if nothing is transmitting.
    self.is_transmitting = -1 if one thread is waiting for another thread to finish.
    self.is_transmitting = 1 if a thread is transmitting
    """

    def __init__(self):
        self.lock = threading.Lock()
        self.is_transmitting = 0

    def can_transmit(self):
        self.lock.acquire()
        val = self.is_transmitting
        self.lock.release()
        return val == 1

    def end_transmit(self):
        self.lock.acquire()
        self.is_transmitting = 0
        self.lock.release()

    def start_transmit(self):
        """ Tries to acquire the lock to start transmitting.  If the lock is acquired
        by another thread, sets self.is_transmitting = -1 then returns False.
        """
        self.lock.acquire()
        if self.is_transmitting == 0:
            self.is_transmitting = 1
            self.lock.release()
            return True
        elif self.is_transmitting == 1:
            self.is_transmitting = -1
            self.lock.release()
            return False
        else:
            self.lock.release()
            return False


tlock = TransmitLock()


def setSlave(PiBus):
    """ 
    set which arduino to talk to. slave(0) for arduino 1 and slave(1) for arduino 2
    """
    device = 0
    bus = PiBus
    spi.open(device, bus)
    spi.mode = 0
    spi.max_speed_hz = 115200


def transmit(message):
    try:
        while tlock.can_transmit():
            print(message)
            tx = spi.writebytes([message])
            #time.sleep(0.1)
        tlock.end_transmit()
    finally:
        tx = spi.writebytes([ord('S')])
        spi.close()


def fwd(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    setSlave(1)
    cmd = ord('F')
    # print b
    print(cmd)
    transmit(cmd)
    # cmd = ord(param) -- do some math on the param to separate different speeds.
    # Maybe >100 one speed <100 another set speed


def back(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    setSlave(1)
    cmd = ord('B')
    # print b
    print(cmd)
    transmit(cmd)


def left(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    setSlave(1)
    cmd = ord('L')
    # print b
    print(cmd)
    transmit(cmd)


def right(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    setSlave(1)
    cmd = ord('R')
    # print b
    print(cmd)
    transmit(cmd)


def stop():
    while not tlock.start_transmit():
        time.sleep(0.1)
    setSlave(1)
    cmd = ord('S')
    # print b
    try:
        i = 0
        while i < 10:
            print(cmd)
            tx = spi.writebytes([cmd])
            #time.sleep(0.1)
            i += 1
        tlock.end_transmit()
    finally:
        tx = spi.writebytes([ord('S')])
        spi.close()

def LineFollow():
    setSlave(1)
    cmd = ord('T')  # for tape follow
    # print b
    print(cmd)
    transmit(cmd)


def ObjectDetection():
    setSlave(0)
    cmd = ord('O')
    # print b
    print(cmd)
    transmit(cmd)
