import cv2
import json
import numpy as np
import sys
from statistics import mean, median
sys.path.append("..")
from util.util import undistort_image, read_json
from util.detector import Detector
from part3_tag_locate import parse_calibration_data, calc_tag_data, get_x_y_angle_offsets

def error_calc_part3(imgfile, calib_file, calib_positions):
    '''
    To streamline error calculations
    '''

    calibrationFile = open(calib_file)

    # opens and reads the calibration board positions
    with open(calib_positions, 'r') as data_file:
        json_data = data_file.read()
    position_data = json.loads(json_data)

    # parses each individual data
    position_data_x, position_data_y, position_data_angle = parse_tag_data(position_data, False)



    calib_data = parse_calibration_data(calib_file)

    det = Detector()

    # Reads the image and undistorts/gray scales the image for detection by the Detector class
    frame = cv2.imread(imgfile)
    undst = undistort_image(frame, calib_data["camera_matrix"], calib_data["dist_coeffs"])
    gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)
    detections = det.detect(gray, return_image=False)

    tag_data = calc_tag_data(calib_data, detections)
    tag_x, tag_y, tag_angle = parse_tag_data(tag_data, True)

    assert len(tag_data) == len(position_data), "Must have same number of AprilTag data in observed tags and in position file"
    x_errors = tag_x - position_data_x
    y_errors = tag_y - position_data_y
    angle_errors = tag_angle - position_data_angle

    mean_x_errors = mean(x_errors)
    mean_y_errors = mean(y_errors)
    mean_angle_errors = mean(angle_errors)

    median_x_errors = median(x_errors)
    median_y_errors = median(y_errors)
    median_angle_errors = median(angle_errors)

    max_x_error = max(x_errors)
    max_y_error = max(y_errors)
    max_angle_error = max(angle_errors)

    data_error = [
        {
            "data": "X Position",
            "mean_error": mean_x_errors,
            "median_error": median_x_errors,
            "max_error": max_x_error
        },
        {
            "data": "Y Position",
            "mean_error": mean_y_errors,
            "median_error": median_y_errors,
            "max_error": max_y_error
        },
        {
            "data": "Angle",
            "mean_error": mean_angle_errors,
            "median_error": median_angle_errors,
            "max_error": max_angle_error
        }
    ]

    # write all the data to a json file
    with open("error_calc.json", "w") as outfile:
        json.dump(data_error, outfile)
    

def error_calc_part1():
    '''
    Function that calculates error regarding checkerboard capture in part 1
    '''
    # dimensions of a checkerboard (3cm x 3cm)

    # testing what the corners array outputs
    corners = None
    found_checkerboard = False
    # Get checkerboard interactively
    image = cv2.imread("../calib/calib_checkerboard.jpg")

    # In real time, conver the image to gray-scale
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    found_checkerboard, corners = cv2.findChessboardCorners(
        gray_image, (9, 6), None
    )
        
    print(str(corners))

    return image, gray_image, corners


def parse_tag_data(data, tag_file):
    '''
    Helper function to parse the relevant tag data (x, y positions, along with angle)
    '''
    x_data = []
    y_data = []
    angle_data = []
    for i in range(len(data)):
        x_data.append(data[i]['x'])
        y_data.append(data[i]['y'])
        angle_data.append(data[i]['orientation']) if tag_file else angle_data.append(data[i]['angle'])
    return np.array(x_data), np.array(y_data), np.array(angle_data)
    

if __name__ == "__main__":
    error_calc_part3("../../images/clipboard/clipboard02.png", "../calib/calibration.json", "../calib/calibration_board_positions.json")
    # error_calc_part1()


