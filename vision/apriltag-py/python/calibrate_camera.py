from __future__ import print_function
import numpy as np
import cv2
from cv2 import *
from cv2 import VideoCapture
import argparse
import time
import numpy as np
from util import get_image, write_matrix_to_file


def main_with_video():
    """
    This is the main entry point of the camera calibration script.
    Run this with the following args:

    python3 calibrate_camera.py -r <rows> -c <cols>

    IMPORTANT!
    Make sure the rows entered is (# of boxes in a column) - 1,
    cols = (# of boxes in a row) - 1

    This has to do with OpenCV's computation of an
    "inner chessboard". This offset will be built in later, but
    that would require changing documentation before an implementation
    has been built.

    Once you've done that, the code will open a program that shows a
    picture of the checkerboard and any calibration lines the
    computer vision library made. Press any key other than
    ESCAPE to continue the calibration process. It is recommended
    to press ESCAPE if the camera does not see the entire board.

    The code will then compute what it needs to do to calibrate the camera
    and write an output in a file typically named 0.calib.

    """

    parser = argparse.ArgumentParser(
        description='calibrate camera intrinsics using OpenCV')

    parser.add_argument('-r', '--rows', metavar='N', type=int,
                        required=True,
                        help='# of chessboard corners in vertical direction')

    parser.add_argument('-c', '--cols', metavar='N', type=int,
                        required=True,
                        help='# of chessboard corners in horizontal direction')

    parser.add_argument('-s', '--size', metavar='NUM', type=float, default=1.0,
                        help='chessboard square size in user-chosen units (should not affect results)')

    parser.add_argument('-n', '--nums', metavar='NUM', type=int, default=1,
                        help='number of cameras to calibrate')

    parser.add_argument('-id', '--cameraid', metavar='NUM', type=int, default=0,
                        help='ID of the camera to calibrate')

    # TODO add multiple camera support - currently assuming ONE camera only.

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    # Capture vars
    cameras = []
    camera_ids = []
    NUM_CAMERAS = args['nums']
    img_points = []
    obj_points = []

    # Constants
    # Prepare object points - taken from tutorials
    objp = np.zeros((args['rows'] * args['cols'], 3), np.float32)
    objp[:, :2] = np.mgrid[0:args['cols'],
                           0:args['rows']].T.reshape(-1, 2)

    WIN_SIZE = (11, 11)
    ZERO_ZONE = (-1, -1)
    # TODO TERM_CRITERIA_ITER used in C++, using MAX_ITER OK?
    TERM_CRITERIA = (TERM_CRITERIA_EPS +
                     TERM_CRITERIA_MAX_ITER, 30, 0.001)  # 0.1 --> 0.001

   # Make sure each camera is accessible, and set it up if it is.
    for i in range(NUM_CAMERAS):
        camera = VideoCapture(i)
        img_points.insert(i, [])
        obj_points.insert(i, [])
        if (VideoCapture.isOpened(camera)):
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            camera.set(cv2.CAP_PROP_FPS, 30)
            cameras.append(camera)
            camera_ids.append(i)
            pass
        else:
            print("Failed to open video capture device " + str(i))
            print("Did you check that all cameras are plugged in and ready?")
            quit()

    # Make checkerboard points "Calibration variables"
    # Official docs says checkerboard size should be (cols, rows)
    checkerboard_size = (args['cols'], args['rows'])

    frame = []
    gray = None
    corners = []

    # find the checkerboard
    for i in range(len(cameras)):
        frame.append(None)  # placeholder for the camera's image to overwrite
        while True:  # Loop until checkerboard corners are found
            # Take a picture and convert it to grayscale
            frame[i] = get_image(cameras[i])
            gray = cv2.cvtColor(frame[i], COLOR_BGR2GRAY)

            # Find the checkerboard
            flags = CALIB_CB_ADAPTIVE_THRESH + CALIB_CB_NORMALIZE_IMAGE + \
                CALIB_CB_FAST_CHECK
            retval, corners = cv2.findChessboardCorners(
                gray, (args['cols'], args['rows']), None)
            if not retval:
                continue  # No checkerboard, so keep looking

            if len(corners) != 0:
                print("Found checkerboard on " + str(i))
                obj_points[i].append(objp)
                corners = cornerSubPix(
                    gray, corners, WIN_SIZE, ZERO_ZONE, TERM_CRITERIA)
                img_points[i].append(corners)
                break
            assert (frame[i].any() != None)
            assert (corners.any() != None)
        ret = True
        # Draw corners / lines on the image to show the user
        drawChessboardCorners(frame[i], checkerboard_size, corners, ret)

    # Show the image and prompts to user for confirmation
    print("Press any key other than ESCAPE to continue")
    print("Press ESCAPE to abort calibration. If the camera can't see " +
          "the entire board, you should press ESCAPE and try again.")
    for i in camera_ids:
        print("This is what camera " + str(i) + " sees.")
        imshow(str(i), frame[i])
        key = cv2.waitKey(0)
        if key == 27:
            print("Calibration process aborted.")
            exit(0)

    # Write the calibration file
    print("Beginning calibration file creation process")
    camera_matrix = []
    dist_coeffs = []
    rvecs = []
    tvecs = []
    for i in range(len(cameras)):
        if not cameras[i].isOpened():
            continue
        if len(obj_points[i]) == 0:
            print("No checkerboards detected on camera" + str(i))
            continue

        # TODO check if calib exists first
        # Might not do this and just overwrite each time.
        print("Calibrating camera " + str(camera_ids[i]))
        obj_points[i] = np.asarray(obj_points[i])
        ret_r, mtx_r, dist_r, rvecs_r, tvecs_r = cv2.calibrateCamera(
            obj_points[i], img_points[i],
            (len(obj_points), len(obj_points[0])), None, None)
        print("Writing calibration file")
        calib_file = open(str(camera_ids[i]) + ".calib", "w+")
        calib_file.write("camera_matrix =")
        write_matrix_to_file(mtx_r, calib_file)
        calib_file.write("dist_coeffs =")
        write_matrix_to_file(dist_r, calib_file)
        calib_file.close()

        print("Calibration file written to " + str(camera_ids[i]) + ".calib")


if __name__ == '__main__':
    main_with_video()
