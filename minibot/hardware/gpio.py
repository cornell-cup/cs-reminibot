"""
Minibot GPIO classes.
"""

class DigitalInput():
    """
    Digital input pin.
    """
    def __init__(self, pin):
        """
        Constructor.
        Args:
            pin (int): Digital pin number.
        """
        self.pin = pin

    def read(self):
        """
        Read input from the digital pin.
        Return:
            int: 0 or 1 for LOW or HIGH voltage.
        """
        raise NotImplementedError

class DigitalOutput():
    """
    Digital output pin.
    """
    def __init__(self, pin):
        """
        Constructor.
        Args:
            pin (int): Digital pin number.
        """
        self.pin = pin

    def set_low(self):
        """
        Set the digital output pin to low.
        """
        raise NotImplementedError

    def set_high(self):
        """
        Set the digital output pin to high.
        """
        raise NotImplementedError

class PWM():
    """
    PWM used on a minibot.
    """
    def __init__(self, pin, frequency, duty_cycle=0):
        """
        Constructor.
        Args:
            pin (int): Pin that the PWM is connected to on the minibot.
            frequency (int): Frequency of the PWM.
            duty_cycle (int): Duty cycle of the PWM.
        """
        self.pin = pin
        self.frequency = frequency
        self.duty_cycle = duty_cycle

    def set_frequency(self, frequency):
        """
        Sets frequency of the PWM.
        """
        self.frequency = frequency

    def set_duty_cycle(self, duty_cycle):
        """
        Sets duty cycle of the PWM.
        """
        self.duty_cycle = duty_cycle

    def stop(self):
        """
        Stops the PWM.
        """
        raise NotImplementedError("PWM.stop")