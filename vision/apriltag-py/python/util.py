from cv2 import *
import numpy as np
import json
"""
Utility module for common actions in this module and in OpenCV.
"""


def get_image(camera):
    """
    Gets the image the camera currently sees. Blocks until an image is found.

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


def get_offsets_from_file(file):
    """
    Gets the offsets from the calibration file.
    Requires the file to already be open and reading at the start of
    the offsets label.

    Args:
        :file The already-open calibration file
    """
    temp_line = file.readline()
    items = list(map(lambda x: float(x),
                     temp_line[len("offsets = "):].split(" ")))
    return (items[0], items[1])


def compute_tag_undistorted_pose(camera_matrix, dist_coeffs, transform_matrix, d, tag_size):
    """
    Computes the undistorted tag pose.
    This isn't totally "raw" - we use the args from the calib file
    to account for distortion, but the coordinates outputted may need scaling.

    This uses the four corners of the tags for a more accurate computation than
    using only the center of the tag.

    Args:
        :camera_matrix The camera's internal parameters matrix from calibrateCamera()
        :dist_coeffs The camera's distance coefficients from calibrateCamera()
        :transform_matrix The transform matrix, often found in a calib file.
        :d A Detection from the Apritag library's Detector
        :tag_size The size of one side of a tag, in inches.
    """
    img_points = np.ndarray((4, 2))  # 4 2D points
    obj_points = np.ndarray((4, 3))  # 4 3D points

    # Compute transformation using PnP
    for i in range(4):
        img_points[i] = d.corners[i]
    x = 0.5 * tag_size
    obj_points[0] = (-x, -x, 0.0)
    obj_points[1] = (x, -x, 0.0)
    obj_points[2] = (x, x, 0.0)
    obj_points[3] = (-x, x, 0.0)
    ret, rvec, tvec = \
        solvePnP(obj_points, img_points, camera_matrix, dist_coeffs)

    # Make tag_to_camera matrix (homogenous transform matrix)
    """
    The tag_to_camera matrix looks like this:

    dst[0,0] dst[0,1] dst[0,2] tvec[0,0]
    dst[1,0] dst[1,1] dst[1,2] tvec[1,0]
    dst[2,0] dst[2,1] dst[2,2] tvec[2,0]
    0           0       0       1
    """
    dst, jac = Rodrigues(rvec)  # dst is a 3 x 3 rotation matrix
    dst = np.append(dst, tvec, axis=1)
    tag_to_camera = np.append(dst, np.array([[0, 0, 0, 1]]), axis=0)

    # Compute tag coordinates tag_xyz
    # tag_xyz is a column vector [x,y,z,h] where each coordinate is
    # rounded to 3 decimal places.
    # `origin` here is  `data2` in the C++ system
    # It starts at point (0,0) in homogenous coordinates.
    # Matrix multiplication simply applies the transformation.
    origin = np.asmatrix(np.array([[0, 0, 0, 1]]).T)
    tag_to_origin = np.matmul(transform_matrix, tag_to_camera)
    tag_xyz = np.matmul(tag_to_origin, origin)
    tag_xyz = np.around(tag_xyz, decimals=3)

    # Compute orientation (also called heading), in degrees
    sin = tag_to_origin[0, 1]
    cos = tag_to_origin[0, 0]
    angle = np.arccos(cos)
    if sin < 0:
        angle = 2 * np.pi - angle
    angle = angle * 180.0 / np.pi
    return tag_xyz[0][0], tag_xyz[1][0], tag_xyz[2][0], angle


def undistort_image(frame, camera_matrix, dist_coeffs):
    """
    Un-distorts an image and crops the undistorted image back to the same size as
    the original image. Cameras normally have some distortion, but knowing
    some parameters about the camera can allow OpenCV to undo the camera's
    natural distortion.

    WARNING: This is unused. It was once used to try to un-distort images,
    but it only made the distortion worse.
    TODO remove this if unused? Not sure if it is needed for later.

    Args:
        :frame The distorted image
        :camera_matrix The camera's intrinsic parameters from cv2.calibrateCamera
        :dist_coeffs The distortion coefficients from cv2.calibrateCamera

    Returns: The new frame.
    """
    h, w = frame.shape[:2]
    dim = (w, h)
    SCALE_FACTOR = 1
    new_camera_mtx, roi = \
        cv2.getOptimalNewCameraMatrix(
            camera_matrix, dist_coeffs, dim, SCALE_FACTOR, dim)

    # Crop the undistorted image bc it can change shape
    dst = cv2.undistort(frame, camera_matrix,
                        dist_coeffs, None, new_camera_mtx)
    x, y, w, h = roi
    dst = dst[y:y+h, x:x+w]
    return dst

def read_calib_json(filename):
    calib_file = None
    try:
        calib_file = open(filename)
    except FileNotFoundError:
        print("Could not find file: " + filename)
        exit(0)
    assert calib_file

    return calib_file, json.load(calib_file)

def get_camera(idx):
    camera = cv2.VideoCapture(idx)
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera: {}".format(idx))
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 30)
    return camera

def get_numpy_matrix(src, name):
    """
    Get a numpy matrix from a data source (i.e. calib data dict)
    """
    return np.asarray(src[name])

def get_tag_angle(corners):
    """
    Get the angle of a tag relative to the x-axis.
    Args:
      corners (numpy.ndarray list): 
          The four tag corners. The top left corner is at index 0,
          and the subsequent corners are labeled clockwise. This is
          the format in which the detector returns corners.

    """
    tr = corners[1] # top right
    br = corners[2] # bottom right
    X, Y = 0,1 # constants for better naming

    # Use the angle between two vectors formula
    side_length = np.sqrt((tr[X]-br[X])**2 + (tr[Y] - br[Y])**2)
    if tr[Y] > br[Y]:
        # compensate for arrcos always computing the shorter angle
        return (2*np.pi) - np.arccos( (tr[X] - br[X]) / side_length)
    return np.arccos( (tr[X] - br[X]) / side_length)