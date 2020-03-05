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
            # the priority field indicates the priority of the thread that 
            # was waiting for the lock.  If the thread that is executing this if
            # statement does not have its priority equal to the priority of the 
            # thread that was waiting first, do not let it enter this code block
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
            spi.writebytes([message])
            # time.sleep(0.1)
        tlock.end_transmit()
    finally:
        spi.writebytes([ord('S')])
        spi.close()

def acquire_lock():
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.1)

def execute(cmd):
    """ Executes the command and releases the lock """
    setSlave(1)
    print(cmd)
    transmit(cmd)


def fwd(power):
    acquire_lock()
    execute('F')


def back(power):
    acquire_lock()
    execute('B')


def left(power):
    acquire_lock()
    execute('L')


def right(power):
    acquire_lock()
    execute('R')


def stop():
    acquire_lock()
    setSlave(1)
    cmd = ord('S')
    # print b
    try:
        print(cmd)
        for _ in range(5):
            spi.writebytes([cmd])
        tlock.end_transmit()
    finally:
        spi.close()


def LineFollow():
    acquire_lock()
    # The T stands for tape follow
    execute('T')


def ObjectDetection():
    acquire_lock()
    execute('O')
