import cv2
import pyAprilTag
import util
from detection import Detection



class Detector:
  def __init__(self):
    pass

  def detect(self, image, return_image=False): 
    ids, corners, centers, Hs = pyAprilTag.find(image)
    data = []
    for i in range(len(ids)):
        # reversing corners since that's the order they were in for the older library
        corners_list = corners[i].tolist()
        corners_list.reverse()
        data.append(Detection(ids[i],centers[i],corners_list,util.angle(corners_list)))

    data.sort(key=lambda entry : entry.tag_id )
    if return_image:
        return data, image
    else:
        return data
