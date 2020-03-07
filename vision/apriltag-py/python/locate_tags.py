from cv2 import *
import apriltag
import numpy as np
import sys
import time
import requests
from util import get_image, get_matrices_from_file

TAG_SIZE = 6.5
DEVICE_ID = 0
SEND_DATA = True


def main():
    if len(sys.argv) != 3:
        print("Usage: {} <url> <calibration file name>".format(sys.argv[0]))
        exit(0)
    url = sys.argv[1]
    calib_file_name = sys.argv[2]
    calib_file = open(calib_file_name)

    camera = VideoCapture(DEVICE_ID)  # Open the camera
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    # Get matrices
    print("Parsing calibration file " + calib_file_name + "...")
    calib_file, camera_matrix, dist_coeffs = get_matrices_from_file(
        calib_file_name)
    transform_matrix = get_transform_matrix(calib_file)
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

    # TODO make detections, print to terminal, and send to basestation
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
        detections, det_image = detector.detect(gray, return_image=True)
        if len(detections) == 0:
            continue  # Try again if we don't get anything
        print("Found " + str(len(detections)) + " apriltags")
        for d in detections:
            # TODO draw tag - might be better to generalize, because
            # locate_cameras does this too.

            # Compute transformation using PnP
            for i in range(4):
                img_points[i] = d.corners[i]
            x = 0.5 * TAG_SIZE
            obj_points[0] = (-x, -x, 0.0)
            obj_points[1] = (x, -x, 0.0)
            obj_points[2] = (x, x, 0.0)
            obj_points[3] = (-x, x, 0.0)

            ret, rvec, tvec = \
                solvePnP(obj_points, img_points, camera_matrix, dist_coeffs)
            dst, jac = Rodrigues(rvec)
            dst = np.append(dst, tvec, axis=1)
            tag_to_camera = np.append(dst, np.array([[0, 0, 0, 1]]), axis=0)

            # `origin` here is  `data2` in the C++ system
            # It starts at point (0,0) in homogenous coordinates.
            origin = np.asmatrix(np.array([[0, 0, 0, 1]]).T)
            tag_to_origin = np.matmul(transform_matrix, tag_to_camera)
            tag_xyz = np.matmul(tag_to_origin, origin)
            tag_xyz = np.around(tag_xyz, decimals=3)

            print("Tag detection OK")

            sin = tag_to_origin[0, 1]
            cos = tag_to_origin[0, 0]
            angle = np.arccos(cos)
            if sin < 0:
                angle = 2 * np.pi - angle
            angle = angle * 180.0 / np.pi

            MULT_FACTOR = 0.2
            x = MULT_FACTOR * tag_xyz[0][0]
            y = MULT_FACTOR * tag_xyz[1][0]

            print("{} :: {} :: {} {} {} {}".format(
                DEVICE_ID, d.tag_id, x, y, tag_xyz[2][0], angle))

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


if __name__ == '__main__':
    main()
