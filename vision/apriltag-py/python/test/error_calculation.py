import cv2
from ..util import util
from ..util.detector import Detector
import numpy as np
from ..part3_tag_locate import parse_calibration_data, calc_tag_data, get_x_y_angle_offsets

def error_calc(imgfile, calib_file):
    '''
    To streamline error calculations
    '''

    calib_data = calc_tag_data(calib_file)

    det = Detector()

    # Reads the image and undistorts/gray scales the image for detection by the Detector class
    frame = cv2.imread(imgfile)
    undst = util.undistort_image(frame, calib_data["camera_matrix"], calib_data["dist_coeffs"])
    gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)
    detections = det.detect(gray, return_image=False)

    print("Number of detections: " + str(len(detections)))

    tag_data = calc_tag_data(calib_data, detections)

    
