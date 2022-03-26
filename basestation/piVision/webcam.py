from frame_process import * 
import cv2
import json 
import os

# Create an object to read camera video 
camVid = cv2.VideoCapture(0)

#vars for tracking go left/right
leftRight = 0
iteration = 0 

#color options 
#currently defaults to blue; add more colors easily to colors.json 
file = os.path.join("basestation", "piVision", "colors.json")
f = open(file)
colors = json.load(f)

blue_low = colors["colors"][0]["low"]
blue_high = colors["colors"][0]["high"]

while(True): 
    iteration+=1
    if iteration > 10:
        iteration = 0
        leftRight = 0

    _, frame = camVid.read()

    turn, frame = detect_on_frame(frame, blue_low, blue_high)
    leftRight += turn 
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

