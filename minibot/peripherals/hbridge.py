from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
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
        #RGPIO.setup(40, RGPIO.OUT)
        #RGPIO.setup(38, RGPIO.OUT)
        #RGPIO.setup(36, RGPIO.OUT)
        #RGPIO.setup(32, RGPIO.OUT)

        #self.lExtend = RGPIO.PWM(40, 50)
        #self.rExtend = RGPIO.PWM(36, 50)
        #self.lFlap = RGPIO.PWM(38, 50)
        #self.rFlap = RGPIO.PWM(32, 50)

        self.left_speed = 0
        self.right_speed = 0

        left_pwm.set_frequency(100)
        right_pwm.set_frequency(100)

    def get_speed(self):
        """
        Returns the (left speed, right speed) tuple
        """
        return (self.left_speed, self.right_speed)

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
        # self.lextend.set_duty_cycle(0)
        # self.lflap.set_duty_cycle(0)
        # self.rextend.set_duty_cycle(0)
        # self.rflap.set_duty_cycle(0)

    def both_wings(self):
        self.lExtend.start(5.5)
        self.lFlap.start(3.5)
        self.rExtend.start(3.5)
        self.rFlap.start(6)
        # TODO get rid of try statement with another button
        # try:
        while True:
            self.lFlap.ChangeDutyCycle(6)
            self.rFlap.ChangeDutyCycle(5.5)
            print('flap up')
            self.time.sleep(1)

            self.lExtend.ChangeDutyCycle(3.5)
            self.rExtend.ChangeDutyCycle(2.5)
            print('extend')
            self.time.sleep(1)

            self.lExtend.ChangeDutyCycle(6.5)
            self.rExtend.ChangeDutyCycle(5.5)
            print('collapse')
            self.time.sleep(1)

            self.lFlap.ChangeDutyCycle(4.0)
            self.rFlap.ChangeDutyCycle(3.5)
            print('flap down')
            self.time.sleep(1)

        # except KeyboardInterrupt:
        #     # p.stop()
        #     RGPIO.cleanup()

