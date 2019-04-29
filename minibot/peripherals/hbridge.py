from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
import time
import threading

import binascii
import spidev
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
        self.spi = spidev.SpiDev()


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
        print("dragon: deprecated")

    def h_nod(self):
        print("dragon: deprecated")

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

        RGPIO.setup(self.l_motor_f, RGPIO.OUT)
        RGPIO.setup(self.l_motor_b, RGPIO.OUT)
        RGPIO.setup(self.r_motor_f, RGPIO.OUT)
        RGPIO.setup(self.r_motor_b, RGPIO.OUT)
            
        RGPIO.output(self.l_motor_f, RGPIO.LOW)
        RGPIO.output(self.l_motor_b, RGPIO.LOW)
        RGPIO.output(self.r_motor_f, RGPIO.LOW)
        RGPIO.output(self.r_motor_b, RGPIO.LOW)

    def push_up(self):
        print("dragon: deprecated")

    def both_wings(self):
        print("dragon: deprecated")

    def left_extend(self):
        print("dragon: deprecated")

    def left_flap(self):
        print("dragon: deprecated")

    def left_wing(self):
        print("dragon: deprecated")

    def right_extend(self):
        print("dragon: deprecated")

    def right_flap(self):
        print("dragon: deprecated")

    def right_wing(self):
        print("dragon: deprecated")

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

    def setSlave(self, PiBus):
        device = 0
        bus = PiBus
        self.spi.open(device, bus)
        self.spi.mode = 0
        self.spi.max_speed_hz = 115200

    def transmit(self, message):
        try:
            while True:
                tx = self.spi.writebytes([message])
                time.sleep(10)
                rx = self.spi.readbytes(2)
                print('Read: 0x(0)'.format(binascii.hexlify(bytearray(rx))))
        finally:
            self.spi.close()

    def buddy_left(self):
        print("buddy left")
        self.setSlave(0)
        cmd = ord('L')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_right(self):
        print("buddy right")
        self.setSlave(0)
        cmd = ord('R')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_stop(self):
        print("buddy stop")
        self.d_stop()

    def buddy_f(self):
        print("buddy forward")
        self.setSlave(0)
        cmd = ord('F')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_b(self):
        print("buddy backward")
        self.setSlave(0)
        cmd = ord('B')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_left_arm(self):
        print("buddy left arm")
        self.setSlave(1)
        cmd = ord('T')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_right_arm(self):
        print("buddy right arm")
        self.setSlave(1)
        cmd = ord('O')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_right_shoulder(self):
        print("buddy right shoulder")
        self.setSlave(1)
        cmd = ord('S')
        # print b
        print(cmd)
        self.transmit(cmd)

    def buddy_claw(self):
        print("buddy claw")
        self.setSlave(0)
        cmd = ord('C')
        # print b
        print(cmd)
        self.transmit(cmd)
