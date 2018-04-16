"""
Minibot object.
"""
import multiprocessing
from queue import Queue
from minibot.hardware.rpi.gpio import DigitalInput, DigitalOutput, PWM, RGPIO
from minibot.peripherals.colorsensor import ColorSensor
from minibot.peripherals.hbridge import HBridge
import time

class Bot():
    def __init__(self, config):
        self.name = config['name']
        self.sensors = {}
        self.actuators = {}
        self.motors = None;
        self.__parse_config(config)

    def __parse_config(self, config):
        self.actuators["left"] = config["actuators"][0]
        self.actuators["right"] = config["actuators"][1]
        self.motors = HBridge(DigitalOutput(self.actuators["left"]["pinHighLow"]),
                              PWM(self.actuators["left"]["pinPWM"]),
                              DigitalOutput(self.actuators["right"]["pinHighLow"]),
                              PWM(self.actuators["right"]["pinPWM"]))
        self.stop()

        wheelEnabler = DigitalOutput(config["wheelEnablerPin"])
        wheelEnabler.set_high()

        for sensor in config["sensors"]:
            name = sensor["name"]
            pin = sensor["pin"]
            self.sensors[name] = ColorSensor(self, name, pin)

    def stop(self):
        self.motors.set_speed(0, 0)

