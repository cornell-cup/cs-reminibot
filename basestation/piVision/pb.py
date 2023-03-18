import sys 
sys.path.append('../../vision/apriltag-py/python')
sys.path.append('../..')
import cv2
import json 
import os 
import threading, queue
from time import sleep 
import requests

from basestation.routes.index_routes import *

bot_name = sys.argv[1]
mode = sys.argv[2] #0 = camera mode, 1=real time 
pb_map = sys.argv[3]
pb_map = json.loads(pb_map)
base_station = get_basestation()

#todo list: 
#   make sure you can't input other commands while in PB mode 
#   Potentially make it so that python (and ideally blockly) code shows up real time 
#   Maybe move the PB button to the code page 

# def get_rightmost(detections):
#     list.sort(detections, key=lambda d: d.center[0])
#     return detections[-1]

def send_request(args):
    cur = bot_name
    url = "http://localhost:8080/wheels"

    # url = "/wheels"
    headers = {
        "Content-Type": "application/json"
    }
    data=json.dumps({
        "bot_name": cur, 
        "direction": args[1], 
        "power": "5", 
        "mode": "physical blockly"
    })
    requests.post(url, data=data, headers=headers)

def classify(command, commands):
    if command in commands["commands"]["turn left"]: 
        return ["fake_bot", "left"]
    elif command in commands["commands"]["turn right"]:
        return ["fake_bot", "right"]
    elif command in commands["commands"]["go forwards"]:
        return ["fake_bot", "forward"]
    elif command in commands["commands"]["go backwards"]:
        return ["fake_bot", "backward"]
    elif command in commands["commands"]["repeat"]:
        return ["fake_bot", "repeat"]
    elif command in commands["commands"]["end"]:
        return ["fake_bot", "end"]
    elif command in commands["commands"]["custom block"]:
        return ["fake_bot", "custom block"]
    else:
        return ["fake_bot", "stop"] #do nothing if invalid command received 

file = os.path.join("tag_insns.json")
f = open(file)
commands = json.load(f)
previous = None

q = queue.Queue()
q2 = queue.Queue() 

seen = {}
pythonCode = {
    "forward" : "bot.move_forward(100)",
    "backward" : "bot.move_backward(100)",
    "stop" : "bot.stop()",
    "right" : "bot.turn_clockwise(100)",
    "left" : "bot.turn_counter_clockwise(100)", 
    "repeat": "for i in range(n):", 
    "end": "end",
    "custom block": "#custom block no.n"
}

def worker():
    while True:
        task = q.get()
        py_code = pythonCode[task[1]]
        if mode == '1': 
            if(py_code[0:3] == "bot"):
                send_request(task)
                print("pb:" + py_code + "\n")
        else: 
            print("pb:" + py_code + "\n")
        sys.stdout.flush()
        sleep(1.0)

threading.Thread(target=worker, daemon=True).start()

while(True): 
    tag = base_station.get_rfid(bot_name)
    tag = pb_map[tag]
    args = classify(tag, commands)
    seen[tag] = True
    q.put(args)
    # Press q on keyboard to stop recording
    if 0xFF == ord('q'):
        break

# Closes all the frames
cv2.destroyAllWindows() 



