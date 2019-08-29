from subprocess import Popen, PIPE, STDOUT
from flask import Flask, render_template, Response, request
app = Flask(__name__)
import signal
import sys

args = str(sys.argv)

c = '';
for i in range(0, len(sys.argv)):
	c = c + "w"

current = [0,0]
p = Popen(['./locate_tags.x', 'www.google.com', '0.calib'], stdout=PIPE, stdin=PIPE, stderr=PIPE, universal_newlines=True)


@app.route('/check', methods=['GET'])
def check():
	"""Verification method for the GUI app to ensure user has entered a valid IP for vision station"""
	return "OK!"


@app.route('/coordinates')
def getCoords():
	# global prevx
	# global prevy
	# global prevcam
		#print("got request")
		# try:
		locationstring = p.stdin.write(c)
		p.stdin.flush()
		locations = []
		for i in range(0, len(sys.argv)-1):
			locations.append(p.stdout.readline())
		# while(True):
		# 	locationstring = []
		# 	out = p.stdin.write(b'w')
		# 	locationstring.append(out)
		# print("hey")
		result = ['', '']
		for i in range(0, len(locations)):
			
			stringarr = locations[i].split()
			tagid = stringarr[2]
			avgx = float(stringarr[4]) * 2/3
			avgy = float(stringarr[5]) * 2/3
			if avgx > 20:
				avgx = 20
			if avgy > 20:
				avgy = 20
			if avgx < -20:
				avgx = -20
			if avgy < -20:
				avgy = -20
			result[int(tagid)] = str(avgx) + " " + str(avgy) + " " + stringarr[7]

		return result[0] + ';' + result[1]
		

		#currcam = stringarr[0]

		# if (prevcam >= currcam and len(prevx) != 0):
		# 	prevx = list(map(float, prevx))
		# 	prevy = list(map(float, prevy))
		# 	avgx = sum(prevx)/(len(prevx)) * 2/3
		# 	avgy = sum(prevy)/(len(prevy)) * 2/3
		# 	if avgx > 20:
		# 		avgx = 20
		# 	if avgy > 20:
		# 		avgy = 20
		# 	if avgx < -20:
		# 		avgx = -20
		# 	if avgy < -20:
		# 		avgy = -20
		# 	current = [avgx, avgy]
		# 	print(current)
		# 	prevx = []
		# 	prevy = []
		# prevx = prevx + [currx]
		# prevy = prevy + [curry]
		# prevcam = currcam

""" gracefully exits if sent a control+C """
def sigint_handler(signal, frame):
	global p
	print("\n\nBuddybot coordinate program is exiting and terminating locate_tags, goodbye!!!!")
	p.terminate()
	sys.exit(0)


if __name__ == '__main__':
	# gracefully exit with CTRL+C
	signal.signal(signal.SIGINT, sigint_handler)
	app.run(host = '0.0.0.0')

