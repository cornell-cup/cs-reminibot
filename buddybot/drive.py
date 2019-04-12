import RPi.GPIO as RGPIO
import time

class Drive:
    def __init__(self):
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setwarnings(False)

        self.l_motor_f=27
        self.r_motor_f=6
        self.l_motor_b=25
        self.r_motor_b=12

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)
        self.stop()

    def left(self, drive_time):
        start_time = time.time()
        while time.time() - start_time < drive_time:
                RGPIO.output(self.l_motor_f, RGPIO.LOW)
                RGPIO.output(self.l_motor_b, RGPIO.HIGH)
                RGPIO.output(self.r_motor_f, RGPIO.HIGH)
                RGPIO.output(self.r_motor_b, RGPIO.LOW)
        self.stop()

    def right(self, drive_time):
        start_time = time.time()
        while time.time() - start_time < drive_time:
                RGPIO.output(self.l_motor_f, RGPIO.HIGH)
                RGPIO.output(self.l_motor_b, RGPIO.LOW)
                RGPIO.output(self.r_motor_f, RGPIO.LOW)
                RGPIO.output(self.r_motor_b, RGPIO.HIGH)
        self.stop()

    def forward(self):
        RGPIO.output(self.l_motor_f, RGPIO.HIGH)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.HIGH)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

    def backward(self, drive_time):
        start_time = time.time()
        while time.time() - start_time < drive_time:
                RGPIO.output(self.l_motor_f, RGPIO.LOW)
                RGPIO.output(self.l_motor_b, RGPIO.HIGH)
                RGPIO.output(self.r_motor_f, RGPIO.LOW)
                RGPIO.output(self.r_motor_b, RGPIO.HIGH)
        self.stop()

    def stop(self):
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

