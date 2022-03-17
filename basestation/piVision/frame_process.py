# https://www.etutorialspoint.com/index.php/328-python-opencv-specific-color-detction-from-capture-video

import cv2
import numpy as np
import math

#Detects the most circular object on frame 
def detect_on_frame(frame, low, high): 
  # Convert BGR to HSV
  hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

  # define blue color range
  light_blue = np.array(low)
  dark_blue = np.array(high)

  # Threshold the HSV image to get only blue colors
  mask = cv2.inRange(hsv, light_blue, dark_blue)

  # Bitwise-AND mask and original image
  output = cv2.bitwise_and(frame,frame, mask= mask)
  gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)
  _, binary = cv2.threshold(gray, 100, 255, cv2.THRESH_OTSU)
  invertedBinary = ~binary
  contours, _ = cv2.findContours(invertedBinary, cv2.RETR_TREE,
  cv2.CHAIN_APPROX_SIMPLE)

  for c in contours:
    area = cv2.contourArea(c)
    if area < 20:
      cv2.fillPoly(binary, pts=[c], color=0)

  binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51,51)))
  contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

  rows = len(binary)
  cols = len(binary[0])
  middle = cols/2
  diff = rows * cols 
  if(len(contours) == 0):
    return 0, frame #no contour detected 

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

  #draw  contour of most circular shape w/ particular color
  cv2.drawContours(frame, [con], 0, (0, 255, 0),3)

  if(cen > middle): 
    return 1, frame
  else:
    return -1, frame


