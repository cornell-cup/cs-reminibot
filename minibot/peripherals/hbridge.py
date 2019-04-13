from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
import time
from threading import Thread
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
        self.hNod = None
        self.hTurn = None

        self.left_speed = 0
        self.right_speed = 0

        left_pwm.set_frequency(100)
        right_pwm.set_frequency(100)

        # for laser
        self.pwm_emitter = None

        ### Trigger and firing ###
        # trigger
        self.p_trigger = 19
        self.trigger_reset_time = 0.25
        self.trigger_check_time = 0.015
        # IR emitter LED + laser
        self.p_emitter = 23
        self.emitter_freq = 36000
        self.emitter_duration = 0.25
        self.emitter_duty_cycle = 50

        ### Hit detection and lives ###
        # IR receivers
        self.p_detection = 24
        # hit display LEDs and piezo
        self.p_hit = 26
        self.hit_immunity_time = 1
        self.hit_feedback_duration = 0.75
        self.hit_check_time = 0.005
        # life display LEDs
        self.p_life = (16, 20, 21)
        self.max_lives = 3

        ### Feedback buzzer ###
        self.p_buzzer = 4

        ### Feedback vibrator ###
        self.p_vibrator = 17

        ### Reset and game controls ###
        # reset button
        self.p_reset = 13

        ### Laser tag motors
        self.l_motor_f = 27
        self.l_motor_b = 25

        self.r_motor_f = 6
        self.r_motor_b = 12

        self.servop = None


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
        #self.set_speed(0, 0)
        try:
            self.lExtend.stop()
            self.lFlap.stop()
            self.rFlap.stop()
            self.rExtend.stop()
        except:
            print("[ERROR] Not in dragon mode")

    def h_turn(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(5, RGPIO.OUT)
        self.hTurn = RGPIO.PWM(5, 50)
        self.hTurn.start(7.5)
        while True:
            self.hTurn.ChangeDutyCycle(2.5)
            time.sleep(1)
            print("down")
            self.hTurn.ChangeDutyCycle(7.5)
            time.sleep(1)
            print("up")

    def h_nod(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        RGPIO.setup(23, RGPIO.OUT)
        self.hNod = RGPIO.PWM(23, 50)
        self.hNod.start(8.5)
        while True:
            self.hNod.ChangeDutyCycle(12.5)
            time.sleep(1)
            print("down")
            self.hNod.ChangeDutyCycle(8.5)
            time.sleep(1)
            print("up")

    def d_forward(self):
        print("d_forward")
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)

        RGPIO.output(self.r_motor_f, RGPIO.HIGH)
        RGPIO.output(self.l_motor_f, RGPIO.HIGH)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)

    def d_backward(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)

        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.HIGH)
        RGPIO.output(self.l_motor_b, RGPIO.HIGH)
    
    def d_left(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)

        RGPIO.output(self.r_motor_f, RGPIO.HIGH)
        RGPIO.output(self.l_motor_b, RGPIO.HIGH)
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

    def d_right(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)

        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.l_motor_f, RGPIO.HIGH)
        RGPIO.output(self.r_motor_b, RGPIO.HIGH)

    def d_stop(self):
        print("d_stop")
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)

        RGPIO.setup(6, RGPIO.OUT)
        RGPIO.setup(13, RGPIO.OUT)
        RGPIO.setup(19, RGPIO.OUT)
        RGPIO.setup(26, RGPIO.OUT)
            
        RGPIO.output(6, RGPIO.LOW)
        RGPIO.output(13, RGPIO.LOW)
        RGPIO.output(19, RGPIO.LOW)
        RGPIO.output(26, RGPIO.LOW)

    def push_up(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
        StepPins = [8, 11, 9, 10, 17, 18, 27, 22]

        # setup pins
        for pin in StepPins:
            print("Setup pins")
            RGPIO.setup(pin, RGPIO.OUT)
            RGPIO.output(pin, 0)

        Seq = [
            [1, 0, 0, 0, 1, 0, 0, 1],
            [1, 1, 0, 0, 0, 0, 0, 1],
            [0, 1, 0, 0, 0, 0, 1, 1],
            [0, 1, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 1, 1, 0, 0, 0]]
        # for i in range(512):
        for i in reversed(range(64)):
            for step in reversed(range(8)):
                for pin in range(8):
                    RGPIO.output(StepPins[pin], Seq[step][pin])
                time.sleep(0.001)

        time.sleep(2)

        # for i in range(50):

        for i in range(64):
            for step in range(8):
                for pin in range(8):
                    RGPIO.output(StepPins[pin], Seq[step][pin])
                time.sleep(0.001)
        RGPIO.cleanup()

    def both_wings(self):
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
      
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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
        RGPIO.cleanup()
        RGPIO.setmode(RGPIO.BCM)
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

    def isTrigger(self):
        return RGPIO.input(self.p_trigger)

    def stop_fire(self):
        raise ValueError('stop fire')

    def fire(self):
        print('fire   : starting')
        try:
            while True:
                if self.isTrigger():
                    print('fire   : firing')
                    self.pwm_emitter.start(self.emitter_duty_cycle)
                    Thread.Timer(self.emitter_duration, self.pwm_emitter.stop).start()
                    time.sleep(self.trigger_reset_time)
                else:
                    time.sleep(self.trigger_check_time)
        except ValueError:
            RGPIO.cleanup()

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
