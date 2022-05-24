from detector import Detector
import cv2
import util 

detector = Detector()

# Create an object to read camera video 
camVid = cv2.VideoCapture(0)

while(True): 
    _, frame = camVid.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    detections, det_image = detector.detect(frame, return_image=True)
    
    print("Found " + str(len(detections)) + " apriltags")

    for i, d in enumerate(detections):
        print(d.tag_id)
    
    cv2.imshow("Tag Locations", frame)
    # Press q on keyboard to stop recording
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# release video capture
# and video write objects
camVid.release()

# Closes all the frames
cv2.destroyAllWindows() 



