import RPi.GPIO as RGPIO

RGPIO.setmode(RGPIO.BCM)
RGPIO.setwarnings(False)

l_motor_f=27
r_motor_f=6
l_motor_b=25 # not working
r_motor_b=12

RGPIO.setup(l_motor_f, RGPIO.OUT)
RGPIO.setup(l_motor_b, RGPIO.OUT)
RGPIO.setup(r_motor_f, RGPIO.OUT)
RGPIO.setup(r_motor_b, RGPIO.OUT)
try:
	while True:
		RGPIO.output(l_motor_f, RGPIO.HIGH)
		RGPIO.output(l_motor_b, RGPIO.LOW)
		RGPIO.output(r_motor_f, RGPIO.HIGH)
		RGPIO.output(r_motor_b, RGPIO.LOW)

except(KeyboardInterrupt):
	RGPIO.cleanup()
