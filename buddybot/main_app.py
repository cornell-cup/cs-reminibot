from flask import Flask, render_template, Response, request
from drive import Drive
import threading
import time
app = Flask(__name__)
dr = Drive()

@app.route('/move', methods=['POST'])
def move():
    content = request.json
    direction = content['direction']
    # drive_time = content['drive_time']
    drive_time = 1 # delete this after we add drive_time field to app post request
    if direction == 'forward':
        dr.forward()
	update_response('forward')
    elif direction == 'backward':
        dr.backward(drive_time)
	update_response('backward')
    elif direction == 'stop':
        dr.stop()
	update_response('stop')

    print(direction)
    return direction

@app.route('/response')
def respond():
    return response_str


lock = threading.Lock()    
response_str = ''
request_time = 0

def update_response(string):
    lock.acquire()
    response_str = string
    response_time = time.time() * 1000000
    lock.release()

# Ensure that there is constant communication from the app to the buddybot
# If no request has been sent in the last second then tell buddybot to stop
def reset():
    while(True):
	time.sleep(0.25)
        current_time = time.time() * 1000000
	lock.acquire()
        if current_time - request_time >= 1.0:
	    response_str = ''
    
	

if __name__ == '__main__':
    app.run(host = '0.0.0.0')
