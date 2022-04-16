import sys 
sys.path.append('../../vision/apriltag-py/python')
sys.path.append('../..')
# sys.path.append('../vision/apriltag-py/python')
import cv2
import json 
import os 
import threading, queue
from time import sleep 
import requests

from basestation.routes import base_station
from detector import Detector

bot_name = sys.argv[1]
print(bot_name)


def get_rightmost(detections):
    list.sort(detections, key=lambda d: d.center[0])
    return detections[-1]

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
        return ["fake_bot", "forwards"]
    elif command in commands["commands"]["stop"]:
        return ["fake_bot", "stop"]
    else:
        return ["fake_bot", "stop"] #do nothing if invalid command received 

detector = Detector()
bots = base_station.get_active_bots()
print(len(bots))

file = os.path.join("tag_insns.json")
f = open(file)
commands = json.load(f)

previous = None

q = queue.Queue()

def worker():
    while True:
        task = q.get()
        sleep(3.0)
        send_request(task)

threading.Thread(target=worker, daemon=True).start()

# Create an object to read camera video 
camVid = cv2.VideoCapture(0)
iterations = 0
    
while(True): 
    _, frame = camVid.read()

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    detections, det_image = detector.detect(frame, return_image=True)

    if(detections != None and len(detections) > 0):
        rightmost = get_rightmost(detections)
        if(rightmost.tag_id != previous):
            previous = rightmost.tag_id 
            args = classify(rightmost.tag_id, commands)
            q.put(args)
    
    cv2.imshow("Tag Locations", frame)

    # Press q on keyboard to stop recording
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break


# release video capture
# and video write objects
camVid.release()
# Closes all the frames
cv2.destroyAllWindows() 



