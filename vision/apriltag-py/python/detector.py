import cv2
import sys
try:
  import pyAprilTag
except ImportError:
  print("could not import pyAprilTag")
  try:
    import apriltag
  except:
    print("Unable to import any apriltag detection libraries please check the installation of the vision system")
import util
from detection import Detection



class Detector:
  def __init__(self):
    self.detector = None
    if 'apriltag' in sys.modules:
      self.detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())

  def detect(self, image, return_image=False): 
    if self.detector == None:
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
    else:
      return self.detector.detect(image, return_image)
