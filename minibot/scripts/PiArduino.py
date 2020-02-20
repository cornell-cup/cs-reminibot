import binascii
import spidev
import time
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
        self.priority = 0

    def can_transmit(self):
        self.lock.acquire()
        val = self.is_transmitting
        self.lock.release()
        return val == 1

    def end_transmit(self):
        self.lock.acquire()
        self.is_transmitting = 0
        self.lock.release()

    def start_transmit(self, priority):
        """ Tries to acquire the lock to start transmitting.  If the lock is acquired
        by another thread, sets self.is_transmitting = -1 then returns False.
        """
        self.lock.acquire()
        if self.is_transmitting == 0:
            if self.priority == priority or self.priority == 0:
                self.is_transmitting = 1
                self.priority = 0
                self.lock.release()
                return True
            else:
                self.lock.release()
                return False
        elif self.is_transmitting == 1:
            self.is_transmitting = -1
            self.priority = priority
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
            # time.sleep(0.1)
        tlock.end_transmit()
    finally:
        tx = spi.writebytes([ord('S')])
        spi.close()


def fwd(power):
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('F')
    # print b
    print(cmd)
    transmit(cmd)
    # cmd = ord(param) -- do some math on the param to separate different speeds.
    # Maybe >100 one speed <100 another set speed


def back(power):
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('B')
    # print b
    print(cmd)
    transmit(cmd)


def left(power):
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('L')
    # print b
    print(cmd)
    transmit(cmd)


def right(power):
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('R')
    # print b
    print(cmd)
    transmit(cmd)


def stop():
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('S')
    # print b
    try:
        print(cmd)
        for i in range(500):
            print(cmd)
            tx = spi.writebytes([cmd])
        tlock.end_transmit()
    finally:
        spi.close()


def LineFollow():
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(1)
    cmd = ord('T')  # for tape follow
    # print b
    print(cmd)
    transmit(cmd)


def ObjectDetection():
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    setSlave(0)
    cmd = ord('O')
    # print b
    print(cmd)
    transmit(cmd)