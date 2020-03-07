from cv2 import *
import apriltag
import sys
import numpy as np
import time
from util import get_image, write_matrix_to_file, get_matrices_from_file

TAG_SIZE = 6.5

NUM_DETECTIONS = 4  # The number of tags to detect, usually 4


def main():
    if len(sys.argv) != 2:
        print("Usage: {} <file name>".format(sys.argv[0]))
        exit(0)
    calib_file_name = sys.argv[1]

    camera = VideoCapture(0)  # Open the camera
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    calib_file, camera_matrix, dist_coeffs = get_matrices_from_file(
        calib_file_name)
    calib_file.close()

    print("CAMERA MATRIX: {}".format(camera_matrix))
    print("DIST COEFFS: {}".format(dist_coeffs))

    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []

    img_points = np.ndarray((4 * NUM_DETECTIONS, 2))
    obj_points = np.ndarray((4 * NUM_DETECTIONS, 3))

    detections = []
    while len(detections) != NUM_DETECTIONS:
        frame = get_image(camera)
        gray = cvtColor(frame, COLOR_BGR2GRAY)

        # Use the detector and compute useful values from it
        detections, det_image = detector.detect(gray, return_image=True)
        # show_image(detections, det_image, frame)
        print("Found {} tags".format(len(detections)))
        time.sleep(1)

    LINE_COLOR = (0, 255, 0)  # (B,G,R), so this is green

    for d in detections:
        id = int(d.tag_id)
        # Draw onto the frame - TODO fix int/float bug
        """
        frame = line(frame, tuple(d.corners[0]), tuple(
            d.corners[1]), LINE_COLOR)
        frame = line(frame, d.corners[1], d.corners[2], LINE_COLOR)
        frame = line(frame, d.corners[2], d.corners[3], LINE_COLOR)
        frame = line(frame, d.corners[3], d.corners[0], LINE_COLOR)
        """

        # Compute transformation via PnP
        # TODO Explain why this math exists
        # This was from a tutorial somehwhere and was directly
        # transcribed from the C++ system.
        img_points[0 + 4*id] = d.corners[0]
        img_points[1 + 4*id] = d.corners[1]
        img_points[2 + 4*id] = d.corners[2]
        img_points[3 + 4*id] = d.corners[3]
        a = (id % 2) * 2 + 1
        b = -((id / 2) * 2 - 1)
        x1 = -0.5*TAG_SIZE + a*8.5*0.5
        x2 = 0.5*TAG_SIZE + a*8.5*0.5
        y1 = -0.5*TAG_SIZE + b*11*0.5
        y2 = 0.5*TAG_SIZE + b*11*0.5
        obj_points[0 + 4*id] = (x1, y1, 0.0)
        obj_points[1 + 4*id] = (x2, y1, 0.0)
        obj_points[2 + 4*id] = (x2, y2, 0.0)
        obj_points[3 + 4*id] = (x1, y2, 0.0)

    # Make transform matrices
    ret, rvec, tvec = solvePnP(
        obj_points, img_points, camera_matrix, dist_coeffs)
    dst, jac = Rodrigues(rvec)

    temp = np.append(dst, tvec, axis=1)
    temp = np.append(temp, np.array([[0, 0, 0, 1]]), axis=0)
    origin_to_camera = np.asmatrix(temp)
    camera_to_origin = np.linalg.inv(origin_to_camera)
    print("CAMERA TO ORIGIN: {}".format(camera_to_origin))

    # Generate the location of the camera
    # Seems to use a homogenous coordinates system (x,y,z,k)
    gen_out = np.array([[0], [0], [0], [1]])
    camera_coordinates = np.matmul(camera_to_origin, gen_out)
    print("CAMERA COORDINATES: {}".format(camera_coordinates))

    # write matrix to file
    calib_file = open(calib_file_name, "a")
    rows, cols = np.shape(camera_to_origin)
    calib_file.write("transform_matrix =")
    write_matrix_to_file(camera_to_origin, calib_file)
    calib_file.close()
    print("Finished writing transformation matrix to calibration file")
    pass


if __name__ == '__main__':
    main()
