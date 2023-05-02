import cv2
import numpy as np
import util

cameras = []
count = 0
while True:
  try:
    cameras.append(util.get_camera(count))
    count += 1
  except:
    print("{} cameras detected".format(len(cameras)))
    break
while True:
  count = 0
  for camera in cameras:
    cv2.imshow("Camera " + str(count), util.get_image(camera))
    count += 1
  if cv2.waitKey(1) & 0xFF == ord("q"):
    break
cv2.destroyAllWindows()
for c in cameras:
  c.release()
