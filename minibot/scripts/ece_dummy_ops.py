"""
ECE dummy functions for testing
"""


def fwd(power):
    print("Moving forward with power " + str(power))


def back(power):
    print("Moving backwards with " + str(power))


def wait(sec):
    print("Waiting for " + str(sec) + " seconds")


def stop():
    print("Stopped.")


def ECE_wheel_pwr(power):
    print("Set wheel power to " + str(power))


def ECE_turn_CW(power):
    print("Turning clockwise with power " + str(power))


def ECE_turn_CCW(power):
    print("Turning counterclockwise with power " + str(power))
