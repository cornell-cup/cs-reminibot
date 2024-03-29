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
            self.detector = apriltag.Detector(
                searchpath=apriltag._get_demo_searchpath())

    def detect(self, image, return_image=False):
        data = []
        if self.detector == None:
            ids, corners, centers, Hs = pyAprilTag.find(image)
            for i in range(len(ids)):
                # reversing corners since that's the order they were in for the older library
                corners_list = corners[i].tolist()
                corners_list.reverse()
                data.append(
                    Detection(ids[i], centers[i], corners_list, util.compute_angle(corners_list)))
        else:
            data = [Detection(detection.tag_id, detection.center, detection.corners, util.compute_angle(detection.corners)) for detection in self.detector.detect(image, False)]
        data.sort(key=lambda entry: entry.tag_id)
        if return_image:
            return data, image
        else:
            return data
