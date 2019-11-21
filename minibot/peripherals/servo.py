"""
Minibot Servos.
"""

class Servo():
    """
    Minibot Servo class.
    """
    def __init__(self, pwm):
        """
        Constructor.
        Args:
            pwm (:obj:`PWM`): PWM of the servo.
        """
        self.pwm = pwm
        self.pwm.set_frequency(50)
        self.pwm.set_duty_cycle(7.5)

    def set_angle(self, angle):
        """
        Sets the angle of a non-continuous rotation servo.
        Args:
            angle (float): The angle of the servo in degrees (0 to 180).
        """
        duty_cycle = (angle / 90.0 * 0.5 + 1.5) / 20.0 * 100.0
        self.pwm.set_duty_cycle(duty_cycle)

    def set_speed(self, speed):
        """
        Sets the speed of a continuous rotation servo.
        Args:
            speed (float): The speed of the servo (-1 to 1).
        """
        duty_cycle = (speed * 0.5 + 1.5) / 20.0 * 100.0
        self.pwm.set_duty_cycle(duty_cycle)