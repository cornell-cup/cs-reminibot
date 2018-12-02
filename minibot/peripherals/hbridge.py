from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
import time
"""
Minibot H-Bridge.
"""

class HBridge():
    """
    Minibot H-Bridge class.
    """
    def __init__(self, left_pin, left_pwm, right_pin, right_pwm):
        """
        Constructor.
        Args:
            left_pin (:obj:`DigitalOutput`): Left motor direction pin.
            left_pwm (:obj:`PWM`): PWM of the servo.
            right_pin (:obj:`DigitalOutput`): Right motor direction pin.
            right_pwm (:obj:`PWM`): PWM of the servo.
        """
        self.left_pin = left_pin
        self.left_pwm = left_pwm
        self.right_pin = right_pin
        self.right_pwm = right_pwm

        self.lExtend = None
        self.lFlap = None
        self.rExtend = None
        self.rFlap = None

        self.left_speed = 0
        self.right_speed = 0

        left_pwm.set_frequency(100)
        right_pwm.set_frequency(100)

    def get_speed(self):
        """
        Returns the (left speed, right speed) tuple
        """
        return self.left_speed, self.right_speed

    def set_speed(self, left, right):
        """
        Sets the speed of both motors.
        Args:
            left (float): The speed of the left motor (-100 to 100).
            right (float): The speed of the right motor (-100 to 100).
        """
        self.left_speed = max(min(left, 100.0), -100.0)
        self.right_speed = max(min(right, 100.0), -100.0)
        # divide by hundred because PWMs have values between 1 and -1
        # values are negated because of the wiring setup
        left = -self.left_speed/100.0
        right = -self.right_speed/100.0

        if left < 0:
            self.left_pin.set_high()
            self.left_pwm.set_duty_cycle(abs(left))
        else:
            self.left_pin.set_low()
            self.left_pwm.set_duty_cycle(1-abs(left))

        if right < 0:
            self.right_pin.set_high()
            self.right_pwm.set_duty_cycle(abs(right))
        else:
            self.right_pin.set_low()
            self.right_pwm.set_duty_cycle(1-abs(right))

    def stop(self):
        self.set_speed(0, 0)
        try:
            self.lExtend.stop()
            self.lFlap.stop()
            self.rFlap.stop()
            self.rExtend.stop()
        except:
            print("[ERROR] Not in dragon mode")

    def both_wings(self):
        RGPIO.setup(21, RGPIO.OUT)
        self.lExtend = RGPIO.PWM(21, 50)
        RGPIO.setup(16, RGPIO.OUT)
        self.rExtend = RGPIO.PWM(16, 50)
        RGPIO.setup(20, RGPIO.OUT)
        self.lFlap = RGPIO.PWM(20, 50)
        RGPIO.setup(12, RGPIO.OUT)
        self.rFlap = RGPIO.PWM(12, 50)

        self.lExtend.start(5.5)
        self.lFlap.start(3.5)
        self.rExtend.start(3.5)
        self.rFlap.start(6)
        while True:
            self.lFlap.ChangeDutyCycle(6)
            self.rFlap.ChangeDutyCycle(4)
            print('flap up')
            time.sleep(1)

            self.lExtend.ChangeDutyCycle(3.5)
            self.rExtend.ChangeDutyCycle(5.5)
            print('extend')
            time.sleep(1)

            self.lExtend.ChangeDutyCycle(6.5)
            self.rExtend.ChangeDutyCycle(3.5)
            print('collapse')
            time.sleep(1)

            self.lFlap.ChangeDutyCycle(4.0)
            self.rFlap.ChangeDutyCycle(6.0)
            print('flap down')
            time.sleep(1)

    def left_extend(self):
        RGPIO.setup(21, RGPIO.OUT)
        self.lExtend = RGPIO.PWM(21, 50)

        self.lExtend.start(5.5)
        while True:
            # collapse
            self.lExtend.ChangeDutyCycle(1.5)
            time.sleep(1)
            print("second")
            # extend
            self.lExtend.ChangeDutyCycle(2.5)
            time.sleep(1)
            print("third")

    def left_flap(self):
        RGPIO.setup(20, RGPIO.OUT)
        self.lFlap = RGPIO.PWM(20, 50)

        self.lFlap.start(3.5)
        while True:
            self.lFlap.ChangeDutyCycle(5.5)
            time.sleep(1)
            print("down")
            self.lFlap.ChangeDutyCycle(3.5)
            time.sleep(1)
            print("up")

    def left_wing(self):
        RGPIO.setup(21, RGPIO.OUT)
        self.lExtend = RGPIO.PWM(21, 50)
        RGPIO.setup(20, RGPIO.OUT)
        self.lFlap = RGPIO.PWM(20, 50)

        self.lExtend.start(5.5)
        self.lFlap.start(3.5)
        while True:
            self.lFlap.ChangeDutyCycle(5.5)
            print("flap up")
            time.sleep(1)
            self.lExtend.ChangeDutyCycle(2.5)
            print("extend")
            time.sleep(1)
            self.lExtend.ChangeDutyCycle(5.5)
            print("collapse")
            time.sleep(1)
            self.lFlap.ChangeDutyCycle(3.5)
            print("down")
            time.sleep(1)

    def right_extend(self):
        RGPIO.setup(16, RGPIO.OUT)
        self.rExtend = RGPIO.PWM(16, 50)

        self.rExtend.start(3.5)
        while True:
            self.rExtend.ChangeDutyCycle(5.5)
            time.sleep(1)
            print("extend")
            self.rExtend.ChangeDutyCycle(3.5)
            time.sleep(1)
            print("third")

    def right_flap(self):
        RGPIO.setup(12, RGPIO.OUT)
        self.rFlap = RGPIO.PWM(12, 50)

        self.rFlap.start(6)
        while True:
            self.rFlap.ChangeDutyCycle(4)
            time.sleep(1)
            print("up")
            self.rFlap.ChangeDutyCycle(6.0)
            time.sleep(1)
            print("down")

    def right_wing(self):
        RGPIO.setup(16, RGPIO.OUT)
        self.rExtend = RGPIO.PWM(16, 50)
        RGPIO.setup(12, RGPIO.OUT)
        self.rFlap = RGPIO.PWM(12, 50)

        self.rExtend.start(3.5)
        self.rFlap.start(6)
        while True:
            self.rFlap.ChangeDutyCycle(4)
            print("flap up")
            time.sleep(1)

            self.rExtend.ChangeDutyCycle(5.5)
            print("extend")
            time.sleep(1)

            self.rExtend.ChangeDutyCycle(3.5)
            print("collapse")
            time.sleep(1)

            self.rFlap.ChangeDutyCycle(6.0)
            print("flap down")
            time.sleep(1)
