from fileinput import filename
import cv2
import util
import numpy as np
import json
import argparse
"""
This file qualitatively shows what happens when a
checkerboard calibration is performed.

Instructions for use:
1. Run this script with a checkerboard ready
2. When you have the checkerboard in the desired posiiton, press ENTER.
3. The system will then show three images:
  - The first image is the raw output of the camera
  - The second image shows how the checkerboard was interpreted
  - The third image shows the post-proceesed image.
"""


def main():

    # Get args
    args = get_args()

    # Get checkerboard
    cols, rows = args["cols"], args["rows"]
    camera = util.get_camera(args["cameraid"])
    image, gray_image, corners = get_checkerboard_interactive(
        camera, cols, rows)
    cv2.waitKey(0)
    camera.release()

    # Compute transform matrix
    # From tutorial:
    # https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_calib3d/py_calibration/py_calibration.html#calibration
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
    obj_points = np.zeros((rows*cols, 3), np.float32)
    obj_points[:, :2] = np.mgrid[0:cols, 0:rows].T.reshape(-1, 2)
    img_points = cv2.cornerSubPix(
        gray_image, corners, (11, 11), (-1, -1), criteria)
    ret, mat, dist, rvecs, tvecs = cv2.calibrateCamera(
        [obj_points],
        [img_points],
        gray_image.shape[::-1],
        None,
        None
    )
    height, width = image.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(
        mat, dist, (width, height), 1, (width, height))

    # Undistort
    dst = cv2.undistort(image, mat, dist, None, new_mtx)

    # Crop
    x, y, w, h = roi
    dst = dst[y:y+height, x:x+width]

    # Show new image
    cv2.imshow("Converted image", dst)
    cv2.waitKey(0)

    calib_data = dict()
    calib_data["camera_matrix"] = mat.tolist()
    calib_data["dist_coeffs"] = dist.tolist()
    calib_data["new_camera_matrix"] = new_mtx.tolist()
    calib_data["roi"] = {
        "x": x,
        "y": y,
        "w": w,
        "h": h
    }

    if args["output"]:
        filename = args["output"].strip()
        filename = filename if filename[-5:].lower() == ".json" else filename + ".json"
        print("Writing calibration file")
        with open(filename, "w+") as calib_file:
            json.dump(calib_data, calib_file)
    else:
        print(json.dumps(calib_data))

    cv2.destroyAllWindows()


def get_checkerboard_interactive(camera, cols, rows):
    """
    Draws chessboard corners live. Returns when space (" ") is pressed.

    Returns:
    image of the checkerboard,
    gray_scale image of the checkerbaord,
    list pf corners of the checkerboard in image.
    """
    corners = None
    found_checkerboard = False
    # Get checkerboard interactively
    while True:
        image = util.get_image(camera)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        found_checkerboard, corners = cv2.findChessboardCorners(
            gray_image, (cols, rows), None
        )
        if found_checkerboard:
            cv2.drawChessboardCorners(image, (cols, rows), corners, True)
        cv2.imshow("Checkerboard Calibration", image)
        if cv2.waitKey(1) & 0xFF == ord(" ") and found_checkerboard:
            break
        
    return image, gray_image, corners


def get_image_on_keypress(camera):
    image = None
    while True:
        image = util.get_image(camera)
        cv2.imshow("Raw Image", image)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
    return image


def get_args():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(
        description="calibrate camera intrinsics using OpenCV"
    )

    parser.add_argument(
        "-r",
        "--rows",
        metavar="<rows>",
        type=int,
        required=True,
        help="# of chessboard corners in vertical direction",
    )

    parser.add_argument(
        "-c",
        "--cols",
        metavar="<cols>",
        type=int,
        required=True,
        help="# of chessboard corners in horizontal direction",
    )

    parser.add_argument(
        "-s",
        "--size",
        metavar="<size>",
        type=float,
        default=1.0,
        help="chessboard square size in user-chosen units (should not affect results)",
    )

    parser.add_argument(
        "-n",
        "--nums",
        metavar="<num-cameras>",
        type=int,
        default=1,
        help="number of cameras to calibrate",
    )

    parser.add_argument(
        "-id",
        "--cameraid",
        metavar="<camera-id>",
        type=int,
        default=0,
        help="ID of the camera to calibrate",
    )

    parser.add_argument(
        "-o",
        "--output",
        metavar="<output-file-name>.json",
        type=str,
        default=None,
        help="Name of file to write",
    )

    # TODO add multiple camera support - currently assuming ONE camera only.

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed
    return args

#------------------------------------------

def get_args2():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(
        description="calibrate camera intrinsics using OpenCV"
    )

    parser.add_argument(
        "-s",
        "--size",
        metavar="<size>",
        type=float,
        default=1.0,
        help="chessboard square size in user-chosen units (should not affect results)",
    )

    parser.add_argument(
        "-n",
        "--nums",
        metavar="<num-cameras>",
        type=int,
        default=1,
        help="number of cameras to calibrate",
    )

    parser.add_argument(
        "-id",
        "--cameraid",
        metavar="<camera-id>",
        type=int,
        default=0,
        help="ID of the camera to calibrate",
    )

    parser.add_argument(
        "-o",
        "--output",
        metavar="<output-file-name>.json",
        type=str,
        default=None,
        help="Name of file to write",
    )

    # TODO add multiple camera support - currently assuming ONE camera only.

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed
    return args

def checkerboardTest(rows, cols):
    # TODO: Check inputs
    # Get args
    args = get_args2()

    # Get checkerboard
    cols, rows = cols, rows
    camera = util.get_camera(args["cameraid"])
    image, gray_image, corners = get_checkerboard_interactive(
        camera, cols, rows)
    cv2.waitKey(0)
    camera.release()

    # Compute transform matrix
    # From tutorial:
    # https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_calib3d/py_calibration/py_calibration.html#calibration
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
    obj_points = np.zeros((rows*cols, 3), np.float32)
    obj_points[:, :2] = np.mgrid[0:cols, 0:rows].T.reshape(-1, 2)
    img_points = cv2.cornerSubPix(
        gray_image, corners, (11, 11), (-1, -1), criteria)
    ret, mat, dist, rvecs, tvecs = cv2.calibrateCamera(
        [obj_points],
        [img_points],
        gray_image.shape[::-1],
        None,
        None
    )
    height, width = image.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(
        mat, dist, (width, height), 1, (width, height))

    # Undistort
    dst = cv2.undistort(image, mat, dist, None, new_mtx)

    # Crop
    x, y, w, h = roi
    dst = dst[y:y+height, x:x+width]

    # Show new image
    cv2.imshow("Converted image", dst)
    cv2.waitKey(0)

    calib_data = dict()
    calib_data["camera_matrix"] = mat.tolist()
    calib_data["dist_coeffs"] = dist.tolist()
    calib_data["new_camera_matrix"] = new_mtx.tolist()
    calib_data["roi"] = {
        "x": x,
        "y": y,
        "w": w,
        "h": h
    }

    if args["output"]:
        filename = args["output"].strip()
        filename = filename if filename[-5:].lower() == ".json" else filename + ".json"
        print("Writing calibration file")
        with open(filename, "w+") as calib_file:
            json.dump(calib_data, calib_file)
    else:
        print(json.dumps(calib_data))

    cv2.destroyAllWindows()



if __name__ == "__main__":
    main()
