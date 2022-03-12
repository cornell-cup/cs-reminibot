# https://www.etutorialspoint.com/index.php/328-python-opencv-specific-color-detction-from-capture-video

import cv2
import numpy as np
from sqlalchemy import true
import math

# Create an object to read camera video 
camVid = cv2.VideoCapture(0)

leftRight = 0
iteration = 0 

while(True):
    iteration+=1
    if iteration > 10:
      iteration = 0
      leftRight = 0

    _, frame = camVid.read()
                
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

        
    #draw contours on top of bitmask of video feed of particular color
    #with_contours_bitmask = cv2.drawContours(output, contours, -1,(0,0,255),3)
    #cv2.imshow('bitmask', with_contours_bitmask)
    #if cv2.waitKey(1) & 0xFF == ord('q'):
     # break

    #draw contours on top of video feed of particular color
    #with_Allcontours = cv2.drawContours(frame, contours, -1,(0,0,255),3)
    #cv2.imshow('Allcontours', with_Allcontours)
    #if cv2.waitKey(1) & 0xFF == ord('q'):
    #break

    #draw  contour of most circular shape w/ particular color
    with_Circularcontours = cv2.drawContours(frame, [con], 0, (0, 255, 0),3)

    if(cen > middle): 
      leftRight += 1
    else:
      leftRight -= 1

    if(iteration == 10):
      print("left" if leftRight < 0 else "right")  

    # Display the frame, saved in the file   
    cv2.imshow('MostCircularContour', frame)

    # Press q on keyboard to stop recording
    if cv2.waitKey(1) & 0xFF == ord('q'):
      break

# release video capture
# and video write objects
camVid.release()

# Closes all the frames
cv2.destroyAllWindows() 