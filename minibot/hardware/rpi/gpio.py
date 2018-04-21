"""
Minibot GPIO, specific to Raspberry Pi.
"""

from minibot.hardware.gpio import PWM as MPWM
from minibot.hardware.gpio import DigitalInput as MDigitalInput
from minibot.hardware.gpio import DigitalOutput as MDigitalOutput
import RPi.GPIO as RGPIO

# Sets mode of the GPIO to BCM numbering.
RGPIO.setmode(RGPIO.BCM)

class DigitalInput(MDigitalInput):
    """
    Digital input pin.
    """
    def __init__(self, pin, pull_up_down=None):
        """
        Digital input for the RPi.
        Args:
            pin (int): BCM pin number for the digital input.
            pull_up_down (int): Whether to use an internal pull up or pull down resistor.
        """
        MDigitalInput.__init__(self, pin)
        RGPIO.setup(pin, RGPIO.IN, pull_up_down=pull_up_down)

    def read(self):
        """
        Read digital input from the pin.
        Return:
            int: 0 or 1 for LOW or HIGH voltage.
        """
        return RGPIO.input(self.pin)

class DigitalOutput(MDigitalOutput):
    """
    Digital output pin.
    """
    def __init__(self, pin):
        MDigitalOutput.__init__(self, pin)
        RGPIO.setup(pin, RGPIO.OUT)

    def set_low(self):
        """
        Set the digital output pin to low.
        """
        RGPIO.output(self.pin, RGPIO.LOW)

    def set_high(self):
        """
        Set the digital output pin to high.
        """
        RGPIO.output(self.pin, RGPIO.HIGH)

class PWM(MPWM):
    """
    PWM for MiniBot used for RPi. Inherits from general PWM class.
    """
    def __init__(self, pin, frequency=1, duty_cycle=0):
        """
        Constructor.
        Args:
            pin (int): pin used for minibot.
            frequency (int):  frequency used for minibot's PWM.
            duty_cycle (float): duty cycle of minibot's PWM (0 to 1).
        """
        MPWM.__init__(self, pin, frequency, duty_cycle)
        RGPIO.setup(pin, RGPIO.OUT)
        self.pwm = RGPIO.PWM(pin, frequency)
        self.pwm.start(duty_cycle * 100.0)

    def set_frequency(self, frequency):
        """
        Sets frequency of the PWM on the minibot.
        Args:
            frequency (int): New frequency on the minibot.
        """
        MPWM.set_frequency(self, frequency)
        self.pwm.ChangeFrequency(frequency)

    def set_duty_cycle(self, duty_cycle):
        """
        Sets duty cycle of the PWM on the minibot.
        Args:
            duty_cycle (int): New duty cycle for the PWM.
        """
        MPWM.set_duty_cycle(self, duty_cycle)
        self.pwm.ChangeDutyCycle(duty_cycle * 100.0)

    def stop(self):
        """
        Stops the PWM on the minibot.
        """
        MPWM.stop(self)
