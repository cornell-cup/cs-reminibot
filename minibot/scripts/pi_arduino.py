import binascii
import spidev
import time
import threading
from statistics import median
import os
from datetime import datetime

spi = spidev.SpiDev()
STOP_CMD = "S"
START_TRASMISSION_CMD = "\n"
END_TRASMISSION_CMD = "\r"


class TransmitLock():
    # TODO: implement this class with condition variables
    """ Class to handle locking amongst movement threads.
    self.is_transmitting = 0 if nothing is transmitting.
    self.is_transmitting = -1 if one thread is waiting for another thread to finish.
    self.is_transmitting = 1 if a thread is transmitting
    """

    def __init__(self):
        self.lock = threading.Lock()
        self.is_transmitting = 0
        self.timestamp = 0

    def can_continue_transmitting(self):
        """ Whether the thread that has currently acquired the lock
        can continue to transmit, or not because another thread is waiting to 
        acquire the lock
        """
        with self.lock:
            return self.is_transmitting == 1

    def end_transmit(self):
        with self.lock:
            self.is_transmitting = 0

    def start_transmit(self, timestamp):
        """ Tries to acquire the lock to start transmitting.  If the lock is acquired
        by another thread, sets self.is_transmitting = -1 to tell the other thread
        that it needs to stop transmitting and hand over the lock to the current thread.

        Arguments:
            timestamp: (int) The timestamp of the current thread.  This timestamp is used to
                figure out which thread was waiting for the lock first, so that the thread that
                was waiting first gets priority when accessing the lock
        Returns:  (bool) True if the transmit_lock was successfully acquired, False otherwise.
        """
        with self.lock:
            if self.is_transmitting == 0:
                # the timestamp field indicates the priority of the thread that
                # was waiting first for the lock.  If the current thread's timestamp
                # statement does not have its e priority of the
                # thread that was waiting first, do not let it enter this code block
                if self.timestamp == timestamp or self.timestamp == 0:
                    self.is_transmitting = 1
                    # reset the timestamp field, because the current thread
                    # managed to acquire the lock
                    self.timestamp = 0
                    return True
            # if some other thread is transmitting (self.is_transmitting != 0)
            # and no other thread has told the thread to stop transmitting
            # (self.is_transmitting != -1), then that means the current thread
            # is the first thread that will be waiting for the lock.  Hence,
            # the current thread tells the thread that is trasmitting to stop
            # trasmitting (by setting self.is_transmitting = -1).  The current
            # thread also records its timestamp to indicate that its the next
            # thread that will get to acquire the lock
            elif self.is_transmitting == 1:
                self.is_transmitting = -1
                self.timestamp = timestamp
            # otherwise if self.is_transmitting == -1, don't do anything
            # just return False, this is because some other thread has already
            # told the currently transmitting thread to stop transmitting,
            # and that other thread has already saved its timestamp in
            # self.timestamp so the other thread will acquire the lock before
            # you can.
        return False


tlock = TransmitLock()


def setSlave(pi_bus):
    """
    set which arduino to talk to. slave(0) for arduino 1 and slave(1) for arduino 2
    """
    device = 0
    spi.open(device, pi_bus)
    spi.mode = 0
    spi.max_speed_hz = 115200


def transmit_once(cmd):
    """ Sends each character in the cmd to the Arduino

    Arguments:
        cmd: (str) The command to be sent to the Arduino
            (eg. "F" to tell the Arduino to start driving
             the Minibot forward)
    """
    for char in cmd:
        print(char)
        spi.writebytes([ord(char)])


def transmit_continuously(cmd):
    """ Transmits the cmd continuously to the Arduino 

    Arguments: 
        cmd: (str) The command to be sent to the Arduino
    """
    while tlock.can_continue_transmitting():
        transmit_once(cmd)
    spi.writebytes([ord(STOP_CMD)])


def send_integer_once(num):
    """ Sends a numerical value to the Arduino

    Arguments:
        num: (int) The integer to be sent to the Arduino
    """
    print(num)
    spi.xfer([num])


def read_once():
    """ Reads from the Arduino multiple times and then returns the
    median value.  Hence, it essentially reads from the Arduino
    once but also filters out noise.

    Returns: (int) The median value of reading from the Arduino
        "num_reads" times.  
    """
    num_reads = 5

    # log the results

    values = []
    for _ in range(num_reads):
        now = datetime.now()
        file = open("/home/pi/Documents/" + now.strftime("%H:%M:%S") + ".txt", "w")

        file.write("Reading from Arduino\n")
        values += spi.readbytes(1)
        file.write(values)
        file.close()
        # Need a short delay between each read from the Arduino
        # Without the delay, the Arduino will return 0
        time.sleep(0.02)

    file.write("Original values: {}".format(values) + "\n")
    val = median(values)
    file.write("Median value read is {}".format(val) + "\n")

    return val


def acquire_lock():
    """ Acquires the lock to start sending data over SPI to
    the Arduino.  It also sends the starting character
    to the Arduino to indicate to the Arduino that the Arduino
    will start receiving commands from the Raspberry Pi
    """
    priority = time.time()
    while not tlock.start_transmit(priority):
        time.sleep(0.01)
    # Send the starting character to tell the Arduino
    # that we will be starting to transmit commands to it

    # set slave 1 doesnt work
    setSlave(0)
    transmit_once(START_TRASMISSION_CMD)


def release_lock():
    """ Releases the lock that was used to send data over SPI to
    the Arduino.  It also sends the ending character
    to the Arduino to indicate to the Arduino that the Arduino
    will stop receiving commands from the Raspberry Pi
    """
    transmit_once(END_TRASMISSION_CMD)
    # spi.close()
    tlock.end_transmit()


def fwd(power):
    """ Move minibot forwards, (currently power field is not in use) """
    acquire_lock()
    transmit_continuously('F')
    release_lock()


def back(power):
    """ Move minibot backwards """
    acquire_lock()
    transmit_continuously('B')
    release_lock()


def left(power):
    """ Move minibot left """
    acquire_lock()
    transmit_continuously('L')
    release_lock()


def right(power):
    """ Move minibot right """
    acquire_lock()
    transmit_continuously('R')
    release_lock()


def stop():
    """ Tell minibot to stop.  Send the command num_stops times just in 
    case there is some data loss over SPI
    """
    acquire_lock()
    # num_stops = 10
    # for _ in range(num_stops):
    #     transmit_once(STOP_CMD)
    transmit_continuously('s')
    release_lock()


def read_ultrasonic():
    acquire_lock()
    transmit_once("du")
    return_val = read_once()
    release_lock()
    return return_val


def read_ir():
    acquire_lock()
    transmit_once('T')
    release_lock()
    return_val = read_once()
    return return_val


def move_servo(angle):
    """ Tell the Arduino to move its servo motor to a specific angle """
    acquire_lock()
    # "ss" tells the Arduino that the next byte sent will correspond to
    # the servo_motor's angle
    transmit_once("ss")
    print("Servo should move to {} angle".format(angle))
    send_integer_once(int(angle))
    release_lock()


def line_follow():
    """ Tell minibot to follow a line """
    acquire_lock()
    transmit_continuously('T')
    release_lock()


def object_detection():
    """ Tell minibot to detect objects using RFID """
    acquire_lock()
    transmit_continuously('O')
    release_lock()


def set_ports(ports):
    """ Tell minibot which motors and sensor correspond to
    which ports.

    Arguments:
        ports: ([str, int]) List where the first element is a port name
            and the second element is the corresponding port number
    """
    acquire_lock()
    ports = ports.split()
    port_name = ports[0]
    port_number = str(ports[1])
    ports_dict = {
        "LMOTOR": "LM",
        "RMOTOR": "RM",
        "MOTOR3": "M",
        "LINE": "L",
        "INFRARED": "I",
        "RFID": "R",
        "ULTRASONIC": "U"
    }
    arr = list(port_number) + list(ports_dict[port_name])
    transmit_once(arr)
    release_lock()
