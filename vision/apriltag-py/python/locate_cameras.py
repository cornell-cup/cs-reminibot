from cv2 import *
import apriltag
import sys
import numpy as np
import time
from calibrate_camera import write_matrix_to_file

TAG_SIZE = 6.5

NUM_DETECTIONS = 1  # The number of tags to detect, usually 4


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

    camera_matrix, dist_coeffs = get_matrices_from_file(calib_file_name)

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
        # TODO intuitively, what is this really computing?
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

    temp = np.append(dst, np.array([[0], [1], [2]]), axis=1)
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


def get_matrices_from_file(file_name):
    """
    Gets the camera matrix and distance coefficients from
    the file name passed in as the first arg of the program.

    Requires: The first argument is a .calib file generated
    from calibrate_camera.py.

    Returns: A tuple of (camera_matrix, dist_coeffs), where
    both matrices are numpy matrices.
    """
    calib_file = None
    try:
        calib_file = open(file_name)
    except FileNotFoundError:
        print("Failed to find file " + file_name)
        exit(0)
    assert (calib_file != None)

    temp_line = calib_file.readline()  # reconstruct camera matrix
    camera_matrix_items = list(map(lambda x: float(x),
                                   temp_line[len("camera_matrix = "):].split(" ")))
    camera_matrix = np.reshape(np.asarray(camera_matrix_items), (3, 3))

    temp_line = calib_file.readline()  # reconstruct dist coeffs matrix
    dist_coeffs_items = list(map(lambda x: float(x),
                                 temp_line[len("dist_coeffs = "):].split(" ")))
    dist_coeffs = np.reshape(np.asarray(dist_coeffs_items), (1, 5))
    calib_file.close()

    # TODO check if dist_coeffs is shaped properly
    return (camera_matrix, dist_coeffs)


def get_image(camera):
    frame = []
    while (not VideoCapture.isOpened(camera)):  # reopen camera if needed
        camera.open()
    while (len(frame) == 0):  # Read from the camera
        read_ok, frame_ret = camera.read()
        if read_ok:
            frame = frame_ret
            break
    return frame


def show_image(detections, image, frame):
    window = 'Camera'
    namedWindow(window)

    num_detections = len(detections)
    print('Detected {} tags.\n'.format(num_detections))

    for i, detection in enumerate(detections):
        print('Detection {} of {}:'.format(i+1, num_detections))
        print()
        print(detection.tostring(indent=2))
        print()

    overlay = frame // 2 + image[:, :, None] // 2

    imshow(window, overlay)
    key = waitKey(1)
    if key == 27:  # quit on escape
        exit(0)
    # TODO do all the drawings / compute transformration/ etc
    # locate_camres.cc:150 or so


if __name__ == '__main__':
    main()
