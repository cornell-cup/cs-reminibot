# https://www.etutorialspoint.com/index.php/328-python-opencv-specific-color-detction-from-capture-video

import cv2
import numpy as np

# Create an object to read camera video 
camVid = cv2.VideoCapture(0)

while(True):
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
    
    with_contours = cv2.drawContours(output, contours, -1,(0,0,255),3)

    #with_contours = cv2.drawContours(frame, contours, -1,(0,0,255),3)

    sumLeft = 0
    sumRight = 0

    rows = len(binary)
    columns = len(binary[0])
    for i in range(rows):
      for j in range(columns):
        if(binary[i][j]> 0):
          if(columns/2 - 1 > j):
           sumLeft = sumLeft + 1
          else:
            sumRight = sumRight + 1

    cv2.putText(frame, fps, (650, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (100, 255, 0), 3, cv2.LINE_AA)
  

    # Display the frame, saved in the file   
    cv2.imshow('output', with_contours)



    # Press Q on keyboard to stop recording
    if cv2.waitKey(1) & 0xFF == ord('Q'):
      break

# release video capture
# and video write objects
cap.release()

# Closes all the frames
cv2.destroyAllWindows() 