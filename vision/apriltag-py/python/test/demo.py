import math
import cv2
import pyAprilTag

'''For windows apriltag library testing'''
def angle(corners):
    x1 = corners[0][0]
    y1 = corners[0][1]
    x2 = corners[1][0]
    y2 = corners[1][1]
    
    return math.degrees(math.atan2(y2 - y1, x2 - x1))


img = cv2.imread("calib_pattern_Tag36h11.png", 0)
ids, corners, centers, Hs = pyAprilTag.find(img)
print(corners)

