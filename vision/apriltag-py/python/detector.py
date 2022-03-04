from ast import List
import math
import cv2
import pyAprilTag
import util
from detection import Detection



class Detector:
  def __init__(self):
    pass
  def detect(self, image): 
    ids, corners, centers, Hs = pyAprilTag.find(image)
    data = []
    for i in range(len(ids)):
        # reversing corners since that's the order they were in for the older library
        corners[i].reverse()
        data.append(Detection(ids[i],centers[i],corners[i],util.angle(corners[i])))

    data.sort(key=lambda entry : entry.id )

    return data
    

