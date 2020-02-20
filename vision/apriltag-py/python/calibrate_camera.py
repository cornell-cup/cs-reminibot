from __future__ import print_function
import numpy as np
import cv2
from cv2 import *
from cv2 import VideoCapture
import argparse
import time
import numpy as np


def main():

    parser = argparse.ArgumentParser(
        description='calibrate camera intrinsics using OpenCV')

    parser.add_argument('filenames', metavar='IMAGE', nargs='+',
                        help='input image files')

    parser.add_argument('-r', '--rows', metavar='N', type=int,
                        required=True,
                        help='# of chessboard corners in vertical direction')

    parser.add_argument('-c', '--cols', metavar='N', type=int,
                        required=True,
                        help='# of chessboard corners in horizontal direction')

    parser.add_argument('-s', '--size', metavar='NUM', type=float, default=1.0,
                        help='chessboard square size in user-chosen units (should not affect results)')

    parser.add_argument('-d', '--show-detections', action='store_true',
                        help='show detections in window')

    options = parser.parse_args()

    if options.rows < options.cols:
        patternsize = (options.cols, options.rows)
    else:
        patternsize = (options.rows, options.cols)

    sz = options.size

    x = np.arange(patternsize[0])*sz
    y = np.arange(patternsize[1])*sz

    xgrid, ygrid = np.meshgrid(x, y)
    zgrid = np.zeros_like(xgrid)
    opoints = np.dstack((xgrid, ygrid, zgrid)).reshape(
        (-1, 1, 3)).astype(np.float32)

    imagesize = None

    win = 'Calibrate'
    cv2.namedWindow(win)

    ipoints = []

    for filename in options.filenames:

        rgb = cv2.imread(filename)

        if rgb is None:
            print('warning: error opening {}, skipping'.format(filename))
            continue

        cursize = (rgb.shape[1], rgb.shape[0])

        if imagesize is None:
            imagesize = cursize
        else:
            assert imagesize == cursize

        print('loaded ' + filename + ' of size {}x{}'.format(*imagesize))

        if len(rgb.shape) == 3:
            gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        else:
            gray = rgb

        retval, corners = cv2.findChessboardCorners(gray, patternsize)

        if options.show_detections:
            display = cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)
            cv2.drawChessboardCorners(display, patternsize, corners, retval)
            cv2.imshow(win, display)
            while cv2.waitKey(5) not in range(128):
                pass

        if not retval:
            print('warning: no chessboard found in {}, skipping'.format(filename))
        else:
            ipoints.append(corners)

    flags = (cv2.CALIB_ZERO_TANGENT_DIST |
             cv2.CALIB_FIX_K1 |
             cv2.CALIB_FIX_K2 |
             cv2.CALIB_FIX_K3 |
             cv2.CALIB_FIX_K4 |
             cv2.CALIB_FIX_K5 |
             cv2.CALIB_FIX_K6)

    opoints = [opoints] * len(ipoints)

    retval, K, dcoeffs, rvecs, tvecs = cv2.calibrateCamera(opoints, ipoints, imagesize,
                                                           cameraMatrix=None,
                                                           distCoeffs=np.zeros(
                                                               5),
                                                           flags=flags)

    assert(np.all(dcoeffs == 0))

    fx = K[0, 0]
    fy = K[1, 1]
    cx = K[0, 2]
    cy = K[1, 2]

    params = (fx, fy, cx, cy)

    print()
    print('all units below measured in pixels:')
    print('  fx = {}'.format(K[0, 0]))
    print('  fy = {}'.format(K[1, 1]))
    print('  cx = {}'.format(K[0, 2]))
    print('  cy = {}'.format(K[1, 2]))
    print()
    print('pastable into Python:')
    print('  fx, fy, cx, cy = {}'.format(repr(params)))
    print()


def main_with_video():

    # Parse args
    # USAGE:
    # python3 calibrate_camera.py -r <rows> -c <cols>
    """
    IMPORTANT!
    Make sure the rows entered is (# of boxes in a column) - 1,
    cols = (# of boxes in a row) - 1

    This has to do with OpenCV's computation of an
    "inner chessboard". This offset will be built in later, but
    that would require changing documentation before an implementation
    has been built.

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

    # TODO add multiple camera support - currently assuming ONE camera only.

    # Capture vars
    cameras = []
    camera_ids = []
    NUM_CAMERAS = 1
    img_points = []
    obj_points = []
    objp = []

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    for i in range(NUM_CAMERAS):
        camera = VideoCapture(i)
        img_points.insert(i, [])
        obj_points.insert(i, [])
        objp = np.zeros((args['rows'] * args['cols'], 3), np.float32)
        objp[:, :2] = np.mgrid[0:args['cols'],
                               0:args['rows']].T.reshape(-1, 2)
        if (VideoCapture.isOpened(camera)):
            camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
            camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
            camera.set(cv2.CAP_PROP_FPS, 30)
            # TODO need push-backs? seems to append empty arrays
            cameras.append(camera)
            camera_ids.append(i)
            pass
        else:
            print("Failed to open video capture device" + str(i))
            quit()

    # Make checkerboard points "Calibration variables"
    checkerboard_size = (args['rows'], args['cols'])
    checkerboard_points = []
    for j in range(args['cols']):
        for i in range(args['rows']):
            point = (i * args['size'], j * args['size'], 0.0)
            checkerboard_points.append(point)

    key = 0
    frame = []
    gray = None
    corners = []

    # find the checkerboard
    # TODO implement key press controls
    # while key != 27:
    while True:
        for i in range(len(cameras)):
            # Open the camera
            while not cameras[i].isOpened():
                cameras[i].open()
                time.sleep(0.1)

            # take a snapshot & convert to gray
            while len(frame) == 0:
                read_ok, f_ret = cameras[i].read()
                if read_ok:
                    frame = f_ret
                time.sleep(0.1)
            gray = cv2.cvtColor(frame, COLOR_BGR2GRAY)

            # Find the checkerboard
            flags = CALIB_CB_ADAPTIVE_THRESH + CALIB_CB_NORMALIZE_IMAGE + CALIB_CB_FAST_CHECK
            ret = False
            # TODO loop this
            retval, corners = cv2.findChessboardCorners(
                gray, checkerboard_size, tuple(corners), flags)
            if len(corners) != 0:
                print("Found checkerboard on " + str(i))
                obj_points[i].append(objp)
                # TODO TERM_CRITERIA_ITER used in C++, using
                # MAX_ITER OK?
                win_size = (11, 11)
                zero_zone = (-1, -1)
                criteria = (TERM_CRITERIA_EPS +
                            TERM_CRITERIA_MAX_ITER, 30, 0.1)
                corners = cornerSubPix(
                    gray, corners, win_size, zero_zone, criteria)
                img_points[i].append(corners)
            assert (frame.any() != None)
            assert (corners.any() != None)
            ret = True
            drawChessboardCorners(frame, checkerboard_size, corners, ret)
        assert(len(frame) != 0)
        # TODO re-enable this for demos
        imshow(str(i), frame)
        cv2.waitKey(0)
        break

    print("Image points")
    print(img_points)
    print("Object points")
    print(obj_points)
    # Write .calib file when 'w' is pressed
    # while key == 'w':
    if True:
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
            print("Calibrating camera " + str(camera_ids[i]))
            print("Writing 1")
            print(obj_points[i])
            obj_points[i] = np.asarray(obj_points[i])
            print("numpy array")
            print(obj_points[i])
            # print(img_points[i])
            # img_points[i] = np.asarray(img_points[i][0])
            # TODO debug this line
            # np.size(frame)
            # print(obj_points[i].shape)
            # print(img_points[i].shape)
            # print(obj_points[i])
            # print(img_points[i][0])
            ret_r, mtx_r, dist_r, rvecs_r, tvecs_r = cv2.calibrateCamera(
                obj_points[i], img_points[i], (len(obj_points), len(obj_points[0])), None, None)
            # calibrateCamera(
            # obj_points[i], img_points[i], frame.shape, camera_matrix, dist_coeffs)
            print("Writing 2")
            print("Writing calibration file")
            calib_file = open(str(camera_ids[i]) + ".calib", "w+")
            calib_file.write("camera_matrix =")
            write_matrix_to_file(mtx_r, calib_file)
            calib_file.write("dist_coeffs =")
            write_matrix_to_file(dist_r, calib_file)
            print(rvecs_r)
            print(tvecs_r)
            calib_file.close()
            print("Calibration file written to " +
                  str(camera_ids[i]) + ".calib")


def write_matrix_to_file(matrix, file):
    num_rows, num_cols = matrix.shape
    for r in range(num_rows):
        for c in range(num_cols):
            file.write(" " + str(matrix[r][c]))
    file.write("\n")


if __name__ == '__main__':
    main_with_video()
