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

    def move_forward(self, power):
        self.motors.set_speed(power, power)

    def move_backward(self, power):
        self.motors.set_speed(-power, -power)

    def turn_clockwise(self, power):
        self.motors.set_speed(power, -power)

    def turn_counter_clockwise(self, power):
        self.motors.set_speed(-power, power)

    def set_wheel_power(self, left, right):
        self.motors.set_speed(left, right)

    def get_wheel_power(self):
        return self.motors.get_speed()

    def get_sensor_feed(self):
        data = {}
        for name, sensor in self.sensors.items():
            data[name] = sensor.get_color_name()
        return data


