from flask import Flask, render_template, Response, request
#from drive import Drive
import threading
import time
app = Flask(__name__)
#dr = Drive()

@app.route('/move', methods=['POST'])
def move():
    content = request.json
    direction = content['direction']
    # drive_time = content['drive_time']
    drive_time = 1 # delete this after we add drive_time field to app post request
    if direction == 'forward':
        #dr.forward()
        print("forward")
        update_response('forward')
    elif direction == 'backward':
        #dr.backward(drive_time)
        print("backward")
        update_response('backward')
    elif direction == 'stop':
        print("stop")
        # dr.stop()
        update_response('stop')

   # print(direction)
    return direction

@app.route('/response')
def respond():
    return response_str

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
        time.sleep(0.25)
        current_time = time.time()
        lock.acquire()
 #       print('Response String: {} Time since response: {}'.format(response_str, current_time-request_time))
        if response_str != 'stop' and current_time - request_time >= 1.0:
            print('stop')
            response_str = 'stop'
        lock.release()
	

if __name__ == '__main__':
    lock = threading.Lock()    
    response_str = 'stop'
    request_time = 0
    reset_thread = threading.Thread(target=reset)
    reset_thread.start()
    app.run(host = '0.0.0.0')
