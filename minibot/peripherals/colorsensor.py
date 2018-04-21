"""
Color Sensor for the MiniBot.
"""

from minibot.peripherals.TCS34725 import TCS34725 as CSensor
import logging
import math

# Abstract class representing a sensor
class ColorSensor():
    """
    Color Sensor class.
    """
    def __init__(self, name, pin_number):
        """
        Constructor.
        Args:
             name (:obj:`str`): Name of sensor.
        """
        self.name = name
        self.pin_number = pin_number
        self.color_sensor = CSensor()

        # Hard-coded normalized RGB values for color sensor
        # input. Generated from self._get_rgb().
        self.colors = {
            "RED": normalize((171, 76, 78)),
            "BLUE": normalize((86, 161, 194)),
            "GREEN": normalize((98, 210, 173)),
            "YELLOW": normalize((210, 203, 100)),
            "VIOLET": normalize((142, 140, 160)),
            "WHITE": normalize((344, 450, 372))
        }
        logging.warning("Sensor being registered: " + str(self.name))

    def get_name(self):
        """
        Gets name of sensor.
        """
        return self.name

    def _get_rgb(self, n):
        """
        Given a single color input, generates normalized RGB 3-tuple based on
        n sensor inputs. This is used only when calibrating and updating the
        hard-coded RGB values in self.colors.
        Args:
            n (int): Number of inputs to average.
        """
        r = 0
        g = 0
        b = 0
        for _ in range(n):
            read = self.read()
            r += read[0]
            g += read[1]
            b += read[2]
        return r / n, g / n, b / n

    def read(self):
        """
        Reads and returns normalized RGB data from color sensor.
        """
        rd = self.color_sensor.get_raw_data()
        return normalize((rd[0], rd[1], rd[2]))

    def get_color_name(self):
        """
        Uses color sensor input to guess the color name. Used for
        printing.
        """
        color_guess = ("", 99999999999999999999999999)
        color_actual = self.read()
        for c in self.colors:
            dist = distance(self.colors[c], color_actual)
            if dist < color_guess[1]:
                color_guess = (c, dist)
        return color_guess[0]

def distance(p1, p2):
    """
    Returns distance between two 3-tuples. Used for evaluating color.
    """
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2 + (p1[2] - p2[2]) ** 2)

def normalize(vector):
    """
    Returns a 3-element vector as a unit vector.
    """
    magnitude = vector[0] + vector[1] + vector[2] + 0.0
    return vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude