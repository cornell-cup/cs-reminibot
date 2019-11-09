import time
import threading

"""
ECE dummy functions for testing
TransmitLock is included to mock concurrency behaviors of ECE functions
"""


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


def transmit(message):
    try:
        while tlock.can_transmit():
            print(message)
            # time.sleep([0.1])
        tlock.end_transmit()
    finally:
        pass


def fwd(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    cmd = 'Forward'
    transmit(cmd)


def back(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    cmd = 'Back'
    transmit(cmd)


def left(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    cmd = 'Left'
    transmit(cmd)


def right(power):
    while not tlock.start_transmit():
        time.sleep(0.1)
    cmd = 'Right'
    transmit(cmd)


def stop():
    while not tlock.start_transmit():
        time.sleep(0.1)
    cmd = 'Stop'
    # print b
    try:
        i = 0
        while i < 10:
            print(cmd)
            time.sleep(0.1)
            i += 1
        tlock.end_transmit()
    finally:
        pass


def LineFollow():
    cmd = 'Tape follow'  # "T" = "Tape follow"
    transmit(cmd)


def ObjectDetection():
    cmd = 'Object detect'
    transmit(cmd)


"""
def fwd(power):
    print("Moving forward with " + str(power))


def back(power):
    print("Moving backwards with " + str(power))


def wait(sec):
    print("Waiting for " + str(sec) + " seconds")


def stop():
    print("Stopped.")


def ECE_wheel_pwr(power):
    print("Set wheel power to " + str(power))


def right(power):
    print("Turning clockwise with power " + str(power))


def left(power):
    print("Turning counterclockwise with power " + str(power))


def ObjectDetection():
    print("Switching to Object Detection Mode")


def LineFollow():
    print("Switching to Line Follow mode")
"""
