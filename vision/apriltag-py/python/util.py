from cv2 import *
import numpy as np

"""
Utility module for common actions in this module and in OpenCV.

"""


def get_image(camera):
    """
    Gets the image the camera currently sees.

    Args:
      :camera ID of the camera, as defined by OpenCV's VideoCapture class.

    Returns: A numpy array representing the image. Each point on the image
    is a 3-tuple of integers reprsenting color.

    """
    frame = []
    while (not VideoCapture.isOpened(camera)):  # reopen camera if needed
        camera.open()
    while (len(frame) == 0):  # Read from the camera
        read_ok, frame_ret = camera.read()
        if read_ok:
            frame = frame_ret
            break
    return frame


def write_matrix_to_file(matrix, file):
    """
    Writes a matrix to a file.

    Args:
      matrix (numpy.ndarray): The numpy matrix to write.

      file (_io.TextIOWrapper): The file to write to, typically
      found with open(). The file must be open with write permissions
      BEFORE it is passed in to this function.

    Returns: Nothing.
    """

    num_rows, num_cols = matrix.shape
    for r in range(num_rows):
        for c in range(num_cols):
            file.write(" " + str(matrix[r, c]))
    file.write("\n")


def show_image(detections, image, frame):
    """
    Shows the image in GUI format to the user.

    Args:
        :detections The detections object returned by an Apriltag Detector
        :image The detected image, returned from the Apriltag Detector
        :frame The frame to show it in
    """
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
    # Can do all the drawings / compute transformration/ etc
    # locate_camres.cc:150 or so
    # Not used in production (best for visual debugging)


def get_matrices_from_file(file_name):
    """
    Gets the camera matrix and distance coefficients from
    the file name passed in as the first arg of the program.
    Make sure to CLOSE the file when you are done, as this
    function doesn't do that - this is because locate_tags.py
    uses some of this code as part of another function.

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

    # Matrix dimensions (row x col):
    # camera_matrix: 3 x 3, dist_coeffs: 1 x 5
    return (calib_file, camera_matrix, dist_coeffs)
