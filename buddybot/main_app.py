from flask import Flask, render_template, Response, request, send_from_directory
from drive import Drive
import subprocess
import threading
import time
app = Flask(__name__)
dr = Drive()

@app.route('/move', methods=['POST'])
def move():
    content = request.json
    direction = content['direction']
    if direction == 'forward':
        dr.forward()
        print('forward')
        update_response('forward')
    elif direction == 'backward':
        dr.backward()
        print('backward')
        update_response('backward')
    elif direction == 'left':
        dr.left()
        print('left')
        update_response('left')
    elif direction == 'right':
        dr.right()
        print('right')
        update_response('right')
    elif direction == 'stop':
        dr.stop()
        print('stop')
        update_response('stop')

    return direction


@app.route('/take_pic', methods=['POST'])
def take_pic():
    return "Success"

@app.route('/img', methods=['POST'])
def send_file():
    subprocess.call(["raspistill", "-t", "100", "-w", "640", "-h", "480", "-n", "-q", "5", "-o", "/home/pi/tmp/stream/pic.jpg", "-rot", "180"])
    my_file = "pic.jpg"
    return send_from_directory("/home/pi/tmp/stream", my_file)


lock = threading.Lock()    
response_str = 'stop'
request_time = 0

def update_response(string):
    global response_str
    global request_time
    lock.acquire()
    response_str = string
    request_time = time.time()
    lock.release()

# Ensure that there is constant communication from the app to the buddybot
# If no request has been sent in the last second then tell buddybot to stop
def reset():
    global response_str
    while(True):
        time.sleep(0.05)
        current_time = time.time()
        lock.acquire()
 #       print('Response String: {} Time since response: {}'.format(response_str, current_time-request_time))
        if response_str != 'stop' and current_time - request_time >= 0.20:
            dr.stop()
            print('stop')
            response_str = 'stop'
        lock.release()
	

if __name__ == '__main__':
    reset_thread = threading.Thread(target=reset)
    reset_thread.start()
    app.run(host = '0.0.0.0', threaded=True)
