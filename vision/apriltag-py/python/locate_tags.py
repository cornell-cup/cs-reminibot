from cv2 import *
import apriltag
import argparse
import numpy as np
import sys
import time
import requests
from util import get_image, get_matrices_from_file, undistort_image, get_offsets_from_file
from util import compute_tag_undistorted_pose

# Constants
DEVICE_ID = 0  # The device the camera is, usually 0. TODO make this adjustable

# Arguments
# These are effectively constant after the argument parser has ran.
TAG_SIZE = 6.5  # The length of one side of an apriltag, in inches
MULT_FACTOR = 5  # The scale factor of the output coordinates
SEND_DATA = True  # Sends data to URL if True. Set to False for debug

# DEBUGGING AND TIMING VARIABLES
past_time = -1


def main():
    args = get_args()
    url = args['url']
    if args['url'] == None:
        SEND_DATA = False
    calib_file_name = args['file']
    TAG_SIZE = args['size']
    calib_file = open(calib_file_name)

    camera = VideoCapture(DEVICE_ID)  # Open the camera & set camera arams
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    # Get matrices from calibration file
    print("Parsing calibration file " + calib_file_name + "...")
    calib_file, camera_matrix, dist_coeffs = get_matrices_from_file(
        calib_file_name)
    transform_matrix = get_transform_matrix(calib_file)
    x_offset, y_offset = get_offsets_from_file(calib_file)
    calib_file.close()

    assert (camera_matrix.shape == (3, 3))
    assert (dist_coeffs.shape == (1, 5))
    assert (transform_matrix.shape == (4, 4))

    # print("TRANSFORM MATRIX:\n {}\n".format(transform_matrix))
    print("Calibration file parsed successfully.")
    print("Initializing apriltag detector...")

    # make the detector
    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []

    print("Detector initialized")
    print("")
    print("The program will begin sending data in 3 seconds.")
    print("Press CTRL+C to stop this program.")
    time.sleep(3)
    print("Starting detection")

    img_points = np.ndarray((4, 2))  # 4 2D points
    obj_points = np.ndarray((4, 3))  # 4 3D points
    detections = []

    while True:
        if not camera.isOpened():
            print("Failed to open camera")
            exit(0)

        # take a picture and get detections
        frame = get_image(camera)
        gray = cvtColor(frame, COLOR_BGR2GRAY)

        # Un-distorting an image worsened distortion effects
        # Uncomment this if needed
        # dst = undistort_image(frame, camera_matrix, dist_coeffs)
        # gray = cvtColor(dst, COLOR_BGR2GRAY)
        detections, det_image = detector.detect(gray, return_image=True)
        if len(detections) == 0:
            continue  # Try again if we don't get anything

        print("Found " + str(len(detections)) + " apriltags")

        for d in detections:
            # TODO draw tag - might be better to generalize, because
            # locate_cameras does this too.

            (x, y, z, angle) = compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, transform_matrix, d, TAG_SIZE)

            # Scale the coordinates, and print for debugging
            # prints Device ID :: tag id :: x y z angle
            # TODO debug offset method - is better, but not perfect.
            x = MULT_FACTOR * (x + x_offset)
            y = MULT_FACTOR * (y + y_offset)
            # print(tag_xyz)
            print("{} :: {} :: {} {} {} {}".format(
                DEVICE_ID, d.tag_id, x, y, z, angle))

            # Send the data to the URL specified.
            # This is usually a URL to the base station.
            if SEND_DATA:
                payload = {
                    "id": d.tag_id,
                    "x": x,
                    "y": y,
                    "orientation": angle
                }
                r = requests.post(url, json=payload)
                status_code = r.status_code
                if status_code / 100 != 2:
                    # Status codes not starting in '2' are usually error codes.
                    print("WARNING: Basestation returned status code {}".format(
                        status_code))
    pass


def get_transform_matrix(file):
    """
    Reads the transform matrix from an already-open :file
    Requires: The file passed in is already open, and its next
    thing it reads points to the first letter in the transformation
    matrix label.

    Returns: A 4x4 numpy array populated with entries from
    the calibration file.
    """
    # TODO generalize this? Code is nearly duplicated
    # in locate_cameras.py.
    temp_line = file.readline()  # reconstruct camera matrix
    transform_matrix_items = list(map(lambda x: float(x),
                                      temp_line[len("transform_matrix = "):].split(" ")))
    transform_matrix = np.reshape(np.asarray(transform_matrix_items), (4, 4))
    return transform_matrix


def get_args():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(
        description='Locate and send Apriltag poses')

    parser.add_argument('-u', '--url',
                        metavar='<url>',
                        type=str, required=False,
                        help='URL to send data to')

    parser.add_argument('-f', '--file', metavar='<calib file name>',
                        type=str, required=True,
                        help='.calib file to use for un-distortion')

    parser.add_argument('-s', '--size', metavar='<size>',
                        type=float, required=False, default=6.5,
                        help='size of tags to detect')

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    return args


if __name__ == '__main__':
    main()
