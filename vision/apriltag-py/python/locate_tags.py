from cv2 import *
import apriltag
import numpy as np
import sys
import locate_cameras  # imported to get transform matrix and dist coeffs
import requests
from locate_cameras import get_image, get_matrices_from_file


def main():
    # TODO parse / validate args
    if len(sys.argv) != 2:
        print("Usage: {} <calibration file name>".format(sys.argv[0]))
        exit(0)
    calib_file_name = sys.argv[1]
    calib_file = open(calib_file_name)

    camera = VideoCapture(0)  # Open the camera
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    # Get matrices
    calib_file, camera_matrix, dist_coeffs = get_matrices_from_file(
        calib_file_name)
    transform_matrix = get_transform_matrix(calib_file)
    calib_file.close()
    assert (camera_matrix.shape == (3, 3))
    assert (dist_coeffs.shape == (1, 5))
    assert (transform_matrix.shape == (4, 4))
    # print("TRANSFORM MATRIX:\n {}\n".format(transform_matrix))

    # make the detector
    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []

    # TODO make detections, print to terminal, and send to basestation
    frame = get_image(camera)
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


if __name__ == '__main__':
    main()
