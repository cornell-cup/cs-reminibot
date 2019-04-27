from flask import Flask, render_template, Response, request, send_from_directory
from laser_tag import LaserTag
import subprocess
import threading
import time
"""App to run on the buddybot that processes move requests."""

app = Flask(__name__)
lsr = LaserTag()
lsr.aim_straight()


@app.route('/check', methods=['GET'])
def check():
    """Verification method for the GUI app to ensure user have entered a valid IP for the bot"""
    return "OK!"


@app.route('/move', methods=['POST'])
def move():
    """Moves the buddybot."""
    content = request.json
    direction = content['direction']
    if direction == 'forward':
        lsr.forward()
        print('forward')
        update_response('forward')
    elif direction == 'backward':
        lsr.backward()
        print('backward')
        update_response('backward')
    elif direction == 'left':
        lsr.left()
        print('left')
        update_response('left')
    elif direction == 'right':
        lsr.right()
        print('right')
        update_response('right')
    elif direction == 'stop':
        lsr.stop()
        print('stop')
        update_response('stop')

    return direction

@app.route('/aim', methods=['POST'])
def aim():
    """Moves the laser tag bot's turret"""
    content = request.json
    direction = content['aim_dir']
    if direction == 'straight':
        print('aim straight')
        lsr.aim_straight()
    elif direction == 'left':
        lsr.aim_left()
        print('aim_left')
    elif direction == 'right':
        lsr.aim_right()
        print('aim_right')
    return direction

@app.route('/fire', methods=['POST'])
def fire():
    print("Firing")
    lsr.fire()
    return "Success"


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
    """Updates the time and name of the current movement request."""
    global response_str
    global request_time
    lock.acquire()
    response_str = string
    request_time = time.time()
    lock.release()


def reset():
    """Ensure that there is constant communication from the app to the buddybot
    If no request has been sent in the last second then tell buddybot to stop"""
    global response_str
    while True:
        time.sleep(0.05)
        current_time = time.time()
        lock.acquire()
 #       print('Response String: {} Time since response: {}'.format(response_str, current_time-request_time))
        if response_str != 'stop' and current_time - request_time >= 0.20:
            lsr.stop()
            print('stop')
            response_str = 'stop'
        lock.release()


if __name__ == '__main__':
    reset_thread = threading.Thread(target=reset)
    reset_thread.start()
    app.run(host = '0.0.0.0', threaded=True)
