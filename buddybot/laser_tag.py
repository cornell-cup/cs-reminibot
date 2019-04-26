import sys
sys.path.insert(0, "home/pi/cs-reminibot")
from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
import time
import threading

class LaserTag():
    def fire(self):
        print("BEFORE FIRING")
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(self.p_emitter, RGPIO.OUT)
        self.pwm_emitter = RGPIO.PWM(self.p_emitter, self.emitter_freq)
        self.pwm_emitter.start(self.emitter_duty_cycle)
        threading.Timer(self.emitter_duration, self.pwm_emitter.stop).start()
        # time.sleep(self.trigger_reset_time)
        self.pwm_emitter = None

    def aim_left(self):
        print('aim left')
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(7.2)

        self.servop.ChangeDutyCycle(4.5)
        time.sleep(.1)
        self.servop.ChangeDutyCycle(0)

        self.servop.ChangeDutyCycle(7.2)
        time.sleep(.1)
        self.servop.ChangeDutyCycle(0)
        self.servop = None

    def aim_right(self):
        print('aim right')
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(7.2)

        self.servop.ChangeDutyCycle(4.5)
        time.sleep(.1)
        self.servop.ChangeDutyCycle(0)

        self.servop.ChangeDutyCycle(1.8)
        time.sleep(.1)
        self.servop.ChangeDutyCycle(0)
        self.servop = None

    def aim_straight(self):
        print("aim straight")
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(4, RGPIO.OUT)
        self.servop = RGPIO.PWM(4, 50)
        self.servop.start(7.2)

        self.servop.ChangeDutyCycle(4.5)
        time.sleep(.1)
        self.servop.ChangeDutyCycle(0)
        self.servop = None

