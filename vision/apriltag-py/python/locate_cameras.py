from cv2 import *
import apriltag
import sys
import numpy as np

TAG_SIZE = 6.5


def main():
    if len(sys.argv) != 2:
        print("Usage: {} <file name>".format(sys.argv[0]))
        exit(0)

    camera = VideoCapture(0)  # Open the camera
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    camera_matrix, dist_coeffs = get_matrices_from_file()

    print(camera_matrix)
    print(dist_coeffs)

    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []

    img_points = np.zeros(16)
    obj_points = np.zeros(16)

    # TODO need to loop this?
    while (not VideoCapture.isOpened(camera)):  # reopen camera if needed
        camera.open()
    while (len(frame) == 0):  # Read from the camera
        read_ok, frame_ret = camera.read()
        if read_ok:
            frame = frame_ret
            break
    gray = cvtColor(frame, COLOR_BGR2GRAY)
    detections, det_image = detector.detect(gray, return_image=True)
    # show_image(detections, det_image, frame)
    # TODO draw onto the frame?
    NUM_DETECTIONS = 1
    if len(detections) != 1:
        print("Didn't find exactly 4 apriltags, exiting")
        exit(0)
    for d in detections:
        print(type(d))  # TODO extract data from detection object
    pass


def get_matrices_from_file():
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
        calib_file = open(sys.argv[1])
    except FileNotFoundError:
        print("Failed to find file " + sys.argv[1])
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
    # TODO check if dist_coeffs is shaped properly
    return (camera_matrix, dist_coeffs)


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
