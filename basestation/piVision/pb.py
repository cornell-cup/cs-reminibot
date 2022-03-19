import sys 
sys.path.append('../../vision/apriltag-py/python')
from detector import Detector
import cv2
import json 
import os 

def get_rightmost(detections):
    list.sort(detections, key=lambda d: d.center[0])
    return detections[-1]

def classify(command, commands):
    if command in commands["commands"]["turn left"]: 
        return "turn left"
    elif command in commands["commands"]["turn right"]:
        return "turn right"
    elif command in commands["commands"]["go forwards"]:
        return "go forwards"
    elif command in commands["commands"]["stop"]:
        return "stop"
    else:
        return "undefined command"

detector = Detector()

file = os.path.join("tag_insns.json")
f = open(file)
commands = json.load(f)

previous = None

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
            print(classify(rightmost.tag_id, commands))

    cv2.imshow("Tag Locations", frame)
    # Press q on keyboard to stop recording
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# release video capture
# and video write objects
camVid.release()

# Closes all the frames
cv2.destroyAllWindows() 



