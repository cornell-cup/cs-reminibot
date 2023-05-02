from cv2 import *
import cv2
import util.apriltag as apriltag
import argparse
import numpy as np
import sys
import time
import requests
import math
import json
from constants import *
from util import get_image, get_matrices_from_file, undistort_image, get_offsets_from_file
from util import compute_tag_undistorted_pose

# Constants
DEVICE_ID = 0  # The device the camera is, usually 0. TODO make this adjustable

# Arguments
# These are effectively constant after the argument parser has ran.
MULT_FACTOR = 5  # The scale factor of the output coordinates
SEND_DATA = True


def main():

    def locate_tag(camera, data):

        camera_matrix = np.array(data["camera_matrix"])
        dist_coeffs = np.array(data["dist_coeffs"])
        new_camera_matrix = np.array(data["new_camera_matrix"])
        transformation_matrix = np.array(data["transformation_matrix"])

        detector = apriltag.Detector(
            searchpath=apriltag._get_demo_searchpath())
        frame = []
        gray = []
        while True:
            if not camera.isOpened():
                print("Failed to open camera")
                exit(0)
            ret, frame = camera.read()
            cv2.imshow("april_tag", frame)
            # take a picture and get detections
            k = cv2.waitKey(1)
            if k % 256 == 32:
                print("space has been pressed")
                frame = get_image(camera)
                gray = cvtColor(frame, COLOR_BGR2GRAY)
                cv2.imshow("april_tag", frame)
                # dst = cv2.undistort(frame, camera_matrix,
                #                     dist_coeffs, None, new_camera_matrix)
                # gray = cvtColor(dst, COLOR_BGR2GRAY)
                detections, det_image = detector.detect(
                    gray, return_image=True)

                if len(detections) == 0:
                    print("no tag found")
                    continue
                print("Found " + str(len(detections)) + " apriltags")

                for d in detections:
                    tag_x, tag_y = d.center
                    top_left = d.corners[0]
                    top_right = d.corners[1]
                    bottom_right = d.corners[2]
                    bottom_left = d.corners[3]
                    # TODO draw tag - might be better to generalize, because
                    # locate_cameras does this too.
                    #      tag_x, tag_y = d.center
                    # print("Tag {} found at ({},{})".format(d.tag_id, tag_x, tag_y))
                    # # cv2.circle(frame, d.center, 5, BLUE)
                    # cv2.circle(frame, (int(tag_x), int(tag_y)), 5, (0, 0, 255))

                    # (x, y, z, angle) = compute_tag_undistorted_pose(
                    #     camera_matrix, dist_coeffs, transformation_matrix, d, TAG_SIZE)

                    # Scale the coordinates, and print for debugging
                    # prints Device ID :: tag id :: x y z angle
                    # TODO debug offset method - is better, but not perfect.
                    # x = MULT_FACTOR * (x)
                    # y = MULT_FACTOR * (y)
                    # print(tag_xyz)
                    print("Tag {} found at ({},{})".format(
                        d.tag_id, tag_x, tag_y))

                    cv2.circle(
                        frame, (int(tag_x), int(tag_y)), 5, (0, 0, 255))

                    # angle = math.radians(360 - angle)
                    # cv2.line(
                    # frame, (int(x + 800), int(y)), (int(x + 800 + 50 *
                    #                                     math.cos(angle)), int(y + 50*math.sin(angle))), (255, 0, 0), 5)
                    # cv2.line(
                    #     frame, (int(x + 800), int(y)), (int(x))
                    # )
                cv2.imshow("april_tag", frame)

            if k % 256 == 27:
                break

            # Un-distorting an image worsened distortion effects
            # Uncomment this if needed

            # Try again if we don't get anything

    past_time = -1  # time to start counting. Set just before first picture taken
    num_frames = 0  # number of frames processed

    args = {
        'url': 'http://localhost:8080/vision',
        'file': 'calib0.json',
        'size': 5.5

    }

    url = args['url']
    SEND_DATA = (args['url'] != None)
    calib_file_name = args['file']
    TAG_SIZE = args['size']
    calib_file = open(calib_file_name)

    camera = get_camera()
    data = json.load(calib_file)

    print("Calibration file parsed successfully.")
    print("Initializing apriltag detector...")

    img_points = np.ndarray((4, 2))  # 4 2D points
    obj_points = np.ndarray((4, 3))  # 4 3D points
    detections = []
    past_time = time.time()

    locate_tag(camera, data)

    camera.release()


def get_camera():
    camera = cv2.VideoCapture(0)
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera")
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    camera.set(cv2.CAP_PROP_FPS, VISION_FPS)
    return camera


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
                        type=float, required=False, default=TAG_SIZE,
                        help='size of tags to detect')

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    return args


if __name__ == '__main__':
    main()
