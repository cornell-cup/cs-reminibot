from collections import Counter
import os
from cv2 import *
import cv2
import numpy as np
import json
import math
from constants import *
from util.predictor import Predictor
from sklearn.linear_model import LinearRegression

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
    while (not cv2.VideoCapture.isOpened(camera)):  # reopen camera if needed
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
        cv2.solvePnP(obj_points, img_points, camera_matrix, dist_coeffs)

    # Make tag_to_camera matrix (homogenous transform matrix)
    """
    The tag_to_camera matrix looks like this:

    dst[0,0] dst[0,1] dst[0,2] tvec[0,0]
    dst[1,0] dst[1,1] dst[1,2] tvec[1,0]
    dst[2,0] dst[2,1] dst[2,2] tvec[2,0]
    0           0       0       1
    """
    dst, _ = cv2.Rodrigues(rvec)  # dst is a 3 x 3 rotation matrix
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
    angle = d.angle
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

def read_json(calibration_file_name):
    """ returns file and calibration json as a dictionary """
    calibration_file = None
    try:
        with open(calibration_file_name) as calibration_file:
            assert calibration_file
            return calibration_file, json.load(calibration_file)
    except FileNotFoundError:
        print("Could not find file: " + calibration_file_name)
        exit(0)
    

def get_camera(idx):
    """ returns video capture object """
    camera = cv2.VideoCapture(idx) 
    
    # for windows
    if os.name == 'nt':
        camera = cv2.VideoCapture("/dev/video1")
        
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera: {}".format(idx))
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    camera.set(cv2.CAP_PROP_FPS, VISION_FPS)
    return camera

def get_numpy_matrix(src, name):
    """
    Get a numpy matrix from a data source (i.e. calib data dict)
    """
    return np.asarray(src[name])

def compute_angle(corners):
    """ 
    input: corners in form of [[x1,y1],[x2,y2],[x3,y3],[x4,y4]
    uses (x1,y1) and (x4,y4), top left and bottome right to compute angle of tag
    """
    x1 = corners[0][0]
    y1 = corners[0][1]
    x4 = corners[3][0]
    y4 = corners[3][1]
    
    return (math.degrees(math.atan2(y1-y4, x4 - x1))%360)

def distance(x1, y1, x2, y2):
    """ output: euclidean distance between pints (x1,y1) and (x2,y2）"""
    return math.sqrt((x2-x1)**2 + (y2-y1)**2)

def draw_pose(overlay, camera_params, tag_size, pose, z_sign=1):
    """ overlays x,y,z points of tag corners after changing basis to image plane """
    # object points
    # left bottom, right bottom, right top, left top coordinates of tag with center at (0,0)
    # first dimention inferred with -1
    opoints = np.array([
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        1, -1, -1 * z_sign,
    ]).reshape(-1, 1, 3) * 0.5 * tag_size 


    fx, fy, cx, cy = camera_params

    K = np.array([fx, 0, cx, 0, fy, cy, 0, 0, 1]).reshape(3, 3) # rotation matrix

    rvec, _ = cv2.Rodrigues(pose[:3, :3]) # rotation matrix -> rotation vector
    tvec = pose[:3, 3] # translation vector

    dcoeffs = np.zeros(5) # distortion coefficients

    # projects 3D points to image plane
    ipoints, _ = cv2.projectPoints(opoints, rvec, tvec, K, dcoeffs) 

    ipoints = np.round(ipoints).astype(int)

    ipoints = [tuple(pt) for pt in ipoints.reshape(-1, 2)]

    cv2.line(overlay, ipoints[0], ipoints[1], (0,0,255), 2)
    cv2.line(overlay, ipoints[1], ipoints[2], (0,255,0), 2)
    cv2.line(overlay, ipoints[1], ipoints[3], (255,0,0), 2)
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(overlay, 'X', ipoints[0], font, 0.5, (0,0,255), 2, cv2.LINE_AA)
    cv2.putText(overlay, 'Y', ipoints[2], font, 0.5, (0,255,0), 2, cv2.LINE_AA)
    cv2.putText(overlay, 'Z', ipoints[3], font, 0.5, (255,0,0), 2, cv2.LINE_AA)

def draw_cube(overlay, camera_params, tag_size, pose, z_sign=-1):

    opoints = np.array([
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 1 * z_sign,
        1, -1, 1 * z_sign,
        1, 1, 1 * z_sign,
        -1, 1, 1 * z_sign,
    ]).reshape(-1, 1, 3) * 0.5 * tag_size

    edges = np.array([
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        0, 4,
        1, 5,
        2, 6,
        3, 7,
        4, 5,
        5, 6,
        6, 7,
        7, 4
    ]).reshape(-1, 2)

    fx, fy, cx, cy = camera_params

    K = np.array([fx, 0, cx, 0, fy, cy, 0, 0, 1]).reshape(3, 3)

    rvec, _ = cv2.Rodrigues(pose[:3, :3])
    tvec = pose[:3, 3]

    dcoeffs = np.zeros(5)

    ipoints, _ = cv2.projectPoints(opoints, rvec, tvec, K, dcoeffs)

    ipoints = np.round(ipoints).astype(int)

    ipoints = [tuple(pt) for pt in ipoints.reshape(-1, 2)]

    for i, j in edges:
        cv2.line(overlay, ipoints[i], ipoints[j], (0, 255, 0), 1, 16)

def draw_square(overlay, camera_params, tag_size, pose, z_sign=-1):

    opoints = np.array([
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
        -1, 1, 0,
        -1, -1, 1 * z_sign,
        1, -1, 1 * z_sign,
        1, 1, 1 * z_sign,
        -1, 1, 1 * z_sign,
    ]).reshape(-1, 1, 3) * 0.5 * tag_size

    edges = np.array([
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        0, 4,
        1, 5,
        2, 6,
        3, 7,
        4, 5,
        5, 6,
        6, 7,
        7, 4
    ]).reshape(-1, 2)

    fx, fy, cx, cy = camera_params

    K = np.array([fx, 0, cx, 0, fy, cy, 0, 0, 1]).reshape(3, 3)

    rvec, _ = cv2.Rodrigues(pose[:3, :3])
    tvec = pose[:3, 3]

    dcoeffs = np.zeros(5)

    ipoints, _ = cv2.projectPoints(opoints, rvec, tvec, K, dcoeffs)

    ipoints = np.round(ipoints).astype(int)

    ipoints = [tuple(pt) for pt in ipoints.reshape(-1, 2)]

    for i, j in edges[0:4]:
        cv2.line(overlay, ipoints[i], ipoints[j], (0, 255, 0), 2, 16)

def camera_matrix_to_camera_params(camera_matrix):
    fx = camera_matrix[0][0]
    fy = camera_matrix[1][1]
    cx = camera_matrix[0][2]
    cy = camera_matrix[1][2]
    return (fx, fy, cx, cy)

def get_inputs_and_outputs_for_models(calibration_file_name):
    """ parses calibration file and returns coordinate input, offsets, and angle offsets"""
    calibration_file, calibration_data = read_json(calibration_file_name)
    center_cell_offsets = calibration_data["cell_center_offsets"]
    inputs = []
    x_inputs = []
    y_inputs = []
    x_offsets = []
    y_offsets = []
    angle_offsets = []
    for entry in center_cell_offsets:
        x_inputs.append(tuple([entry["reference_point_x"]]))
        y_inputs.append(tuple([entry["reference_point_y"]]))
        inputs.append((entry["reference_point_x"],entry["reference_point_y"]))
        x_offsets.append(entry["x_offset"])
        y_offsets.append(entry["y_offset"])
        angle_offsets.append(entry["angle_offset"])
    return {"inputs": np.array(inputs), "x_inputs": np.array(x_inputs), "y_inputs": np.array(y_inputs), "x_offsets": np.array(x_offsets), "y_offsets": np.array(y_offsets), "angle_offsets": np.array(angle_offsets)}
    

def get_models_with_calibration_file(calibration_file_name):
    inputs_and_outputs = get_inputs_and_outputs_for_models(calibration_file_name)
    return {
        "x_offsets_model_x_input_only": get_model_with_data(inputs_and_outputs["x_inputs"],inputs_and_outputs["x_offsets"]),
        "x_offsets_model": get_model_with_data(inputs_and_outputs["inputs"],inputs_and_outputs["x_offsets"]),
        "y_offsets_model_y_input_only": get_model_with_data(inputs_and_outputs["y_inputs"],inputs_and_outputs["y_offsets"]),
        "y_offsets_model": get_model_with_data(inputs_and_outputs["inputs"],inputs_and_outputs["y_offsets"]),
        "angle_offsets_model": get_model_with_data(inputs_and_outputs["inputs"],inputs_and_outputs["angle_offsets"])
    }

def get_model_with_data(inputs,outputs):
    return LinearRegression().fit(np.array(inputs), np.array(outputs))

def get_predictors_with_calibration_file(calibration_file_name):
    '''
    The Predictors class takes in a model as a parameter (i.e. LinearRegression), and it is used to more easily
    make predictions with the model
    '''

    models = get_models_with_calibration_file(calibration_file_name)
    return {
        "x_offsets_predictor_x_input_only": Predictor(models["x_offsets_model_x_input_only"]),
        "x_offsets_predictor": Predictor(models["x_offsets_model"]),
        "y_offsets_predictor_y_input_only": Predictor(models["y_offsets_model_y_input_only"]),
        "y_offsets_predictor": Predictor(models["y_offsets_model"]),
        "angle_offsets_predictor": Predictor(models["angle_offsets_model"])
    }

def complement_of_list(full_list, partial_list):
    return [entry for entry in full_list if not (entry in partial_list)]

def weighted_average(values, weights):
    if len(values) != len(weights):
        raise Exception("unequal lengths of values and weights")
    sum = 0
    weights_sum = 0
    for i in range(len(values)):
        sum += (values[i])*(weights[i])
        weights_sum += weights[i]
    if weights_sum == 0:
        raise Exception("weights sum is 0")
    return sum/weights_sum

def get_property_or_default(object, property, default=None):
    return object[property] if object != None and property in object else default

def reject_outliers(data):
    """ filters outliers out of the data, returns filtered dataset"""
    data = np.array(data)
    u = np.mean(data)
    s = np.std(data)
    filtered = [e for e in data if (u - 2 * s < e < u + 2 * s)]
    # May want to lower st.dev for testing performance
    return filtered
    
def to_dict(self):
    """ json to dictionary, returns dictionary """
    return json.loads(json.dumps(self, default=lambda o: o.__dict__))

def average_value_for_key(list_of_dicts, key, remove_outliers=False, threshold=None):
    """ returns average key value for a dictionary. Can include/exclude outliers and set threshold"""
    values = [d[key] for d in list_of_dicts]
    if remove_outliers and threshold == None:
        values_without_outliers = reject_outliers(values)
        values = values if len(values_without_outliers) == 0 else values_without_outliers
    elif remove_outliers:
        mode = mode_value_for_key(list_of_dicts, key)
        values_without_outliers = [value for value in values if abs(value-mode) <= threshold]
        values = values if len(values_without_outliers) == 0 else values_without_outliers
    return float(sum(values)) / len(values)

def mode(sample):
    c = Counter(sample)
    return [k for k, v in c.items() if v == c.most_common(1)[0][1]]

def mode_value_for_key(list_of_dicts, key):
    rounded_values = [round(d[key]) for d in list_of_dicts]
    rounded_values_without_outliers = reject_outliers(rounded_values)
    rounded_values = rounded_values if len(rounded_values_without_outliers) == 0 else rounded_values_without_outliers
    return float(mode(rounded_values)[0])