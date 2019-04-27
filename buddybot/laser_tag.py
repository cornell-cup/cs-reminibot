import sys
sys.path.insert(0, "home/pi/cs-reminibot/minibot/hardware/rpi")
import RPi.GPIO as RGPIO
import time
import threading

class LaserTag():
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

        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(4.5)
        RGPIO.output(4, RGPIO.HIGH)
        self.servop.ChangeDutyCycle(4.5)
        time.sleep(.2)
        RGPIO.output(4, RGPIO.LOW)
        self.servop.ChangeDutyCycle(0)

        self.p_emitter = 23
        self.emitter_freq = 36000
        RGPIO.setup(self.p_emitter, RGPIO.OUT)
        self.pwm_emitter = RGPIO.PWM(self.p_emitter, self.emitter_freq)

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

    def fire(self):
        emitter_duty_cycle = 50
        emitter_duration = 0.25

        print("BEFORE FIRING")
        self.pwm_emitter.start(emitter_duty_cycle)
        threading.Timer(emitter_duration, self.pwm_emitter.stop).start()
        # time.sleep(self.trigger_reset_time)

    def aim_left(self):
        print('aim left')

        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(4.5)
        RGPIO.output(4, RGPIO.HIGH)
        self.servop.ChangeDutyCycle(7.2)
        time.sleep(.2)
        RGPIO.output(4, RGPIO.LOW)
        self.servop.ChangeDutyCycle(0)

    def aim_right(self):
        print('aim right')

        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(4.5)
        RGPIO.output(4, RGPIO.HIGH)
        self.servop.ChangeDutyCycle(1.8)
        time.sleep(.2)
        RGPIO.output(4, RGPIO.LOW)
        self.servop.ChangeDutyCycle(0)

    def aim_straight(self):
        print("aim straight")

        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(4.5)
        RGPIO.output(4, RGPIO.HIGH)
        self.servop.ChangeDutyCycle(4.5)
        time.sleep(.2)
        RGPIO.output(4, RGPIO.LOW)
        self.servop.ChangeDutyCycle(0)

    def cleanup(self):
        RGPIO.cleanup()


