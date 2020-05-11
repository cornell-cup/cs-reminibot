import binascii
import spidev
import time
import threading
from statistics import median

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
            print(message)
            tx = spi.writebytes([ord(message)])
            # time.sleep(0.1)
        tlock.end_transmit()
    finally:
        spi.writebytes([ord('S')])
        spi.close()

def acquire_lock():
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)

def execute(cmd):
    setSlave(1)
    print(cmd)
    transmit(cmd)

def execute_once(cmd):
    setSlave(1)
    print(cmd)
    spi.writebytes([ord(cmd)])
    tlock.end_transmit()

def read_once(cmd):
    NUM_READS = 20
    setSlave(1)
    print(cmd)
    values = []
    for _ in range(NUM_READS):
        values += spi.readbytes(1)
        print(values)
    val = median(values)
    tlock.end_transmit()
    return val
    

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


def read_ultrasonic():
    acquire_lock()
    arr_cmds="\ndu"
    for cmd in arr_cmds:
        execute_once(cmd)
    return read_once('SU')


def LineFollow():
    acquire_lock()
    # The T stands for tape follow
    execute('T')
    
    
def SetPorts():
    acquire_lock()
    ports = ports.split()
    portname = ports[0]
    portnumber = str(ports[1])
    portsdict = {
        "LMOTOR" : "LM",
        "RMOTOR" : "RM",
        "MOTOR3" : "M",
        "LINE" : "L",
        "INFARED" : "I",
        "RFID" : "R",
        "ULTRASONIC" : "U"
    }
    arr = ['\n'] + list(portnumber) + list(portsdict[portname]) + ['\r']
    for x in arr:
        execute_once(x)


def ObjectDetection():
    acquire_lock()
    execute('O')
