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
        # self.motors.set_speed(0, 0)
        self.motors.stop()

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

    def get_sensor_data(self):
        data = {}
        print(self.sensors)
        for name, sensor in self.sensors.items():
            data[name] = sensor.get_color_name()
        return data

    def both_wings_flap_and_extend(self):
        self.motors.both_wings()

    def left_wing(self):
        self.motors.left_wing()

    def left_extend(self):
        self.motors.left_extend()

    def left_flap(self):
        self.motors.left_flap()

    def right_wing(self):
        self.motors.right_wing()

    def right_extend(self):
        self.motors.right_extend()

    def right_flap(self):
        self.motors.right_flap()

    def push_up(self):
        self.motors.push_up()

    def head_nod(self):
        self.motors.h_nod()

    def head_turn(self):
        self.motors.h_turn()

    def d_forward(self):
        self.motors.d_forward()

    def d_backward(self):
        self.motors.d_backward()

    def d_stop(self):
        self.motors.d_stop()

    def d_left(self):
        self.motors.d_left()
 
    def d_right(self):
        self.motors.d_right()

    def b_fire(self):
        self.motors.fire()

    def l_aim(self):
        self.motors.aim_left()

    def r_aim(self):
        self.motors.aim_right()

    def s_aim(self):
        self.motors.aim_straight()

    def stop_fire(self):
        self.motors.stop_fire()
