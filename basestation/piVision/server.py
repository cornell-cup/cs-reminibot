# USAGE
# python3 server.py --prototxt MobileNetSSD_deploy.prototxt --model MobileNetSSD_deploy.caffemodel --montageW 2 --montageH 2

# import the necessary packages
from imutils import build_montages
import numpy as np
from imagezmq import imagezmq
import imutils
import time
from queue import Queue
import cv2
from sqlalchemy import true
import math


# initialize the ImageHub object
imageHub = imagezmq.ImageHub()

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


    imageHub.send_reply(b'OK')

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


    #This print statement isn't displaying anywhere
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

    # if the `q` key was pressed, break from the loop
    if key == ord("q"):
        break

# do a bit of cleanup
cv2.destroyAllWindows()
