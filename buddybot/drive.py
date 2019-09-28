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

    def left(self):
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.HIGH)
        RGPIO.output(self.r_motor_f, RGPIO.HIGH)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

    def right(self):
        RGPIO.output(self.l_motor_f, RGPIO.HIGH)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.HIGH)

    def forward(self):
        RGPIO.output(self.l_motor_f, RGPIO.HIGH)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.HIGH)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

    def backward(self):
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.HIGH)
        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.HIGH)

    def stop(self):
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

