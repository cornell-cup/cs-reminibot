# USAGE
# python3 server.py --prototxt MobileNetSSD_deploy.prototxt --model MobileNetSSD_deploy.caffemodel --montageW 2 --montageH 2

# import the necessary packages
from imutils import build_montages
from datetime import datetime
import numpy as np
from imagezmq import imagezmq
import argparse
import imutils
import time
from queue import Queue
import cv2
from sqlalchemy import true
import math
# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default='piVision/MobileNetSSD_deploy.prototxt',
                help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", default='piVision/MobileNetSSD_deploy.caffemodel',
                help="path to Caffe pre-trained model")
ap.add_argument("-c", "--confidence", type=float, default=0.2,
                help="minimum probability to filter weak detections")
ap.add_argument("-mW", "--montageW", type=int, default=2,
                help="montage frame width")
ap.add_argument("-mH", "--montageH", type=int, default=2,
                help="montage frame height")
args = vars(ap.parse_args())

# initialize the ImageHub object
imageHub = imagezmq.ImageHub()


# load our serialized model from disk
print("[INFO] loading model...")
net = cv2.dnn.readNetFromCaffe(
    "basestation\piVision\MobileNetSSD_deploy.prototxt", "basestation\piVision\MobileNetSSD_deploy.caffemodel")


# initialize the dictionary which will contain  information regarding
# when a device was last active, then store the last time the check
# was made was now
lastActive = {}
lastActiveCheck = datetime.now()

# stores the estimated number of Pis, active checking period, and
# calculates the duration seconds to wait before making a check to
# see if a device was active
ESTIMATED_NUM_PIS = 4
ACTIVE_CHECK_PERIOD = 10
ACTIVE_CHECK_SECONDS = ESTIMATED_NUM_PIS * ACTIVE_CHECK_PERIOD

# assign montage width and height so we can view all incoming frames
# in a single "dashboard"
mW = args["montageW"]
mH = args["montageH"]

# used to record the time when we processed last frame
prev_frame_time = 0

# used to record the time at which we processed current frame
new_frame_time = 0

frame_count = 0

fps = 0
leftRight = 0
iteration = 0 

frame_time_queue = Queue(maxsize=5)

# start looping over all the frames
while True:
    # receive RPi name and frame from the RPi and acknowledge
    # the receipt
    (rpiName, frame) = imageHub.recv_image()
    # cv2.imshow("hey", frame)
    # key = cv2.waitKey(1) & 0xFF


    imageHub.send_reply(b'OK')


    # if a device is not in the last active dictionary then it means
    # that its a newly connected device
    # if rpiName not in lastActive.keys():
    #     print("[INFO] receiving data from {}...".format(rpiName))

    # record the last active time for the device from which we just
    # received a frame
    # lastActive[rpiName] = datetime.now()

    frame_count += 1

    # calculate the frame rate as the average of the last 5 frames
    if (frame_count <= 4):
        prev_frame_time = new_frame_time
        new_frame_time = time.time()
        fps = frame_count/new_frame_time
        frame_time_queue.put(new_frame_time)
    else:
        prev_frame_time = new_frame_time
        new_frame_time = time.time()
        last_frame_time = frame_time_queue.get()
        fps = 5/(new_frame_time - last_frame_time)
        frame_time_queue.put(new_frame_time)

    # converting the fps into integer
    fps = int(fps)

    # converting the fps to string so that we can display it on frame
    # by using putText function
    fps = str(fps)

    iteration+=1
    if iteration > 10:
      iteration = 0
      leftRight = 0

    # resize the frame to have a maximum width of 400 pixels, then
    # grab the frame dimensions and construct a blob
    frame = imutils.resize(frame, width=700, inter=cv2.INTER_NEAREST)

                 
    # Convert BGR to HSV
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # define blue color range
    light_blue = np.array([50,50,50])
    dark_blue = np.array([150,255,255])

    #light_blue = np.array([50,50,50])
    #dark_blue = np.array([150,255,255])

    # Threshold the HSV image to get only blue colors
    mask = cv2.inRange(hsv, light_blue, dark_blue)

    # Bitwise-AND mask and original image
    output = cv2.bitwise_and(frame,frame, mask= mask)

    gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)

    ret, binary = cv2.threshold(gray, 100, 255, cv2.THRESH_OTSU)

    invertedBinary = ~binary

    contours, hierarchy = cv2.findContours(invertedBinary, cv2.RETR_TREE,
    cv2.CHAIN_APPROX_SIMPLE)

    for c in contours:
      area = cv2.contourArea(c)

      if area < 20:
        cv2.fillPoly(binary, pts=[c], color=0)

    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51,51)))
    contours, hierarchy = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

    rows = len(binary)
    cols = len(binary[0])
    middle = cols/2
    diff = rows * cols 
    if(len(contours) == 0):
      continue

    con = contours[0]
    cen = 0

    for c in contours:
      center,radius = cv2.minEnclosingCircle(c)
      cen = center[0]
      area = cv2.contourArea(c)
      circle = math.pi * radius * radius
      if(abs(circle-area)/((area + circle)/2) < diff):
        diff = circle - area 
        con = c 
    
    with_Circularcontours = cv2.drawContours(frame, [con], 0, (0, 255, 0),3)

    if(cen > middle): 
      leftRight += 1
    else:
      leftRight -= 1

    if(iteration == 10):
      print("left" if leftRight < 0 else "right")  
    
    cv2.putText(frame, rpiName, (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

    # puting the FPS count on the frame
    cv2.putText(frame, fps, (650, 30), cv2.FONT_HERSHEY_SIMPLEX,
                1, (100, 255, 0), 3, cv2.LINE_AA)

    
    cv2.imshow("On-Bot Video Stream", frame)

    # detect any kepresses
    key = cv2.waitKey(1) & 0xFF

    # if current time *minus* last time when the active device check
    # was made is greater than the threshold set then do a check
    # if (datetime.now() - lastActiveCheck).seconds > ACTIVE_CHECK_SECONDS:
    #     # loop over all previously active devices
    #     for (rpiName, ts) in list(lastActive.items()):
    #         # remove the RPi from the last active and frame
    #         # dictionaries if the device hasn't been active recently
    #         if (datetime.now() - ts).seconds > ACTIVE_CHECK_SECONDS:
    #             print("[INFO] lost connection to {}".format(rpiName))
    #             lastActive.pop(rpiName)
    #             frameDict.pop(rpiName)

    #     # set the last active check time as current time
    #     lastActiveCheck = datetime.now()

    # if the `q` key was pressed, break from the loop
    if key == ord("q"):
        break

# do a bit of cleanup
cv2.destroyAllWindows()
