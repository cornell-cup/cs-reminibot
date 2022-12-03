from statistics import mode
import cv2
import argparse
from cv2 import waitKey
import numpy as np
import sys
import time
import requests
import util.util as util
from util.detector import Detector
from platform import node as platform_node
from random import randint
from os import environ
from constants import *

BASE_STATION_DEVICE_ID = hash(platform_node()+str(randint(0,1000000))+str(randint(0,1000000))+str(DEVICE_ID)+str(time.time()))

def main():

    # Can factor out the below code
    '''---------------------------------------------------------------------------'''
    # DEBUGGING AND TIMING VARIABLES
    past_time = -1  # time to start counting. Set just before first picture taken
    num_frames = 0  # number of frames processed

    args = get_args()
    url = args["url"]
    SEND_DATA = args["url"] != None
    calib_file_name = args["file"]
    TAG_SIZE = args["size"]
    calib_file = open(calib_file_name)

    camera = util.get_camera(DEVICE_ID)
    FRAME_WIDTH  = camera.get(cv2.CAP_PROP_FRAME_WIDTH)   # float `width`
    FRAME_HEIGHT = camera.get(cv2.CAP_PROP_FRAME_HEIGHT)  # float `height`
    '''---------------------------------------------------------------------------'''

    # ADDED JUST TO SEE WHAT THE FRAME WIDTH AND HEIGHT ARE
    # print(FRAME_WIDTH)
    # print(FRAME_HEIGHT)

    # Get matrices from calibration file
    print("Parsing calibration file " + calib_file_name + "...")
    predictors = util.get_predictors_with_calibration_file(calib_file_name)
    predict_x_offset = predictors["x_offsets_predictor"].predict
    predict_y_offset = predictors["y_offsets_predictor"].predict
    predict_x_offset_x_input_only = predictors["x_offsets_predictor_x_input_only"].predict
    predict_y_offset_y_input_only = predictors["y_offsets_predictor_y_input_only"].predict
    predict_angle_offset = predictors["angle_offsets_predictor"].predict

    """-----------------------------------------------------------------------------------"""
    calib_file, calib_data = util.read_json(calib_file_name)
    transform_matrix = util.get_numpy_matrix(calib_data, "transform_matrix")
    camera_matrix = util.get_numpy_matrix(calib_data, "camera_matrix")
    dist_coeffs = util.get_numpy_matrix(calib_data, "dist_coeffs")
    x_scale_factor = calib_data["scale_factors"]["x"]
    y_scale_factor = calib_data["scale_factors"]["y"]
    overall_center_x_offset = calib_data["overall_center_offset"]["x"]
    overall_center_y_offset = calib_data["overall_center_offset"]["y"]
    overall_angle_offset = calib_data["overall_center_offset"]["angle"]
    center_cell_offsets = calib_data["cell_center_offsets"]
    calib_file.close()
    """-----------------------------------------------------------------------------------"""

    assert camera_matrix.shape == (3, 3)
    assert dist_coeffs.shape == (1, 5)
    assert transform_matrix.shape == (4, 4)


    print("Calibration file parsed successfully.")
    print("Initializing apriltag detector...")

    # make the detector
    detector = Detector()
    frame = []
    gray = []

    print("Detector initialized")
    print("")
    print("The program will begin sending data in 3 seconds.")
    print("Click in the video window and press space to stop this program.")
    time.sleep(3)
    print("Starting detection")

    img_points = np.ndarray((4, 2))  # 4 2D points
    obj_points = np.ndarray((4, 3))  # 4 3D points
    detections = []
    past_time = time.time()
    location_history = []
    discovered_ids = set()
    while True:
        if not camera.isOpened():
            print("Failed to open camera")
            exit(0)

        # Let frame be the image file (if we were to test with a file)
        # take a picture and get detections

        """------------------------------------------------------------------"""
        frame = util.get_image(camera)

        undst = util.undistort_image(frame, camera_matrix, dist_coeffs)
        gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)
        detections = []
        try:
            detections, det_image = detector.detect(gray, return_image=True)
        except Exception:
            pass
        """"-----------------------------------------------------------------"""

        print("Found " + str(len(detections)) + " apriltags")

        
        data_for_BS = {"DEVICE_ID": str(BASE_STATION_DEVICE_ID), "TIMESTAMP": time.time(), "DEVICE_CENTER_X": FRAME_WIDTH/2, "DEVICE_CENTER_Y": FRAME_HEIGHT/2, "position_data" : []}
        snapshot_locations = []
        for i, d in enumerate(detections):
            # TODO draw tag - might be better to generalize, because
            # locate_cameras does this too.

            
            (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, transform_matrix, d, TAG_SIZE
            )

            # Scale the coordinates, and print for debugging
            # prints Device ID :: tag id :: x y z angle
            # TODO debug offset method - is better, but not perfect.
            #center_cell_offset = get_closest_reference_point_offset(detected_x,detected_y,center_cell_offsets)

            ########## Uncomment the 3 lines below if the performance drops
            # x_offset, y_offset, _ = get_x_y_angle_offsets(detected_x, detected_y, center_cell_offsets)
            # x = x_scale_factor * (detected_x + overall_center_x_offset) + x_offset
            # y = y_scale_factor * (detected_y + overall_center_y_offset) + y_offset

            z = detected_z
            x_off, y_off, _ = get_x_y_angle_offsets(detected_x, detected_y, center_cell_offsets)

            x_offset, y_offset, angle_offset = edge_fudge_factor_adjustments(detected_x, detected_y, x_off, y_off, overall_angle_offset)
            # x = x_scale_factor * (detected_x + overall_center_x_offset) + predict_x_offset
            # y = y_scale_factor * (detected_y + overall_center_y_offset) + predict_y_offset
            x = x_scale_factor * (detected_x + overall_center_x_offset) + min(x_offset, predict_x_offset)
            y = y_scale_factor * (detected_y + overall_center_y_offset) + min(y_offset, predict_y_offset)
            
            if (abs(x) > 50 or abs(y) > 20):
                continue

            # angle fudge factor interpolation still needs work,
            # it may be possible but angle errors are not as predictable
            # as distance errors

            ########Uncomment below
            # angle = ((detected_angle + overall_angle_offset)%360)%360
            (ctr_x, ctr_y) = d.center

            angle = ((detected_angle + angle_offset)%360)%360
            # angle = ((detected_angle + predict_angle_offset)%360)%360

            
            # displaying tag id
            cv2.putText(undst, str(d.tag_id),(int(ctr_x), int(ctr_y)), cv2.FONT_HERSHEY_SIMPLEX, .5,  BLUE,2)
            # displays the x and y position of the apriltags
            cv2.putText(undst, str((round(x),round(y))),(int(ctr_x), int(ctr_y)+15), cv2.FONT_HERSHEY_SIMPLEX, .5, MAGENTA, 2)
            # displays the angle of the april tag (why is VISION_FPS added to the coordinate offset? make it 30)
            cv2.putText(undst, str(round(angle)),(int(ctr_x), int(ctr_y)+30), cv2.FONT_HERSHEY_SIMPLEX, .5, CYAN, 2)

            # # prints DEVICE_ID tag id x y z angle
            # print("{}, {},{},{},{},{}".format(BASE_STATION_DEVICE_ID, d.tag_id, x, y, z, angle))
            snapshot_locations.append({"id": str(d.tag_id), "image_x": ctr_x, "image_y": ctr_y,"x": x, "y": y, "orientation": angle})
            # adds the discovered april tag ids into a set
            discovered_ids.add(str(d.tag_id))
        # append the detected april tag details onto location_history
        location_history.append(snapshot_locations)

        average_locations = []
        if len(location_history) >= MAX_LOCATION_HISTORY_LENGTH:
            average_locations = []


            for id in list(discovered_ids):
                locations_with_id = [location for snapshot_locations in location_history for location in snapshot_locations if location["id"] == id]
                if len(locations_with_id) > 0:
                    
                    average_locations.append({
                        "id": id, 
                        "image_x": util.average_value_for_key(locations_with_id, "image_x",True,1), 
                        "image_y": util.average_value_for_key(locations_with_id, "image_y",True,1),
                        "x": util.average_value_for_key(locations_with_id, "x",True,1),
                        "y": util.average_value_for_key(locations_with_id, "y",True,1), 
                        "orientation": util.average_value_for_key(locations_with_id, "orientation",True,1)%360
                    })
                else:
                    discovered_ids.remove(id)
            
            
            # prints DEVICE_ID tag id x y z angle
            print("id,actual_x,actual_y,actual_angle")
            average_locations.sort(key=lambda entry : int(entry["id"]))     
            [print("{},{},{},{}".format(location["id"], location["x"], location["y"], location["orientation"])) for location in average_locations]
            while len(location_history) >= MAX_LOCATION_HISTORY_LENGTH:
                location_history.pop(0)

            data_for_BS["position_data"] = average_locations
            data_for_BS["TIMESTAMP"] = time.time()

            # Send the data to the URL specified.
            # This is usually a URL to the base station.
            if SEND_DATA:
                payload = data_for_BS
                r = requests.post(url, json=payload)
                status_code = r.status_code
                if status_code / 100 != 2:
                    # Status codes not starting in '2' are usually error codes.
                    print(
                        "WARNING: Basestation returned status code {}".format(
                            status_code
                        )
                    )
                else:
                    print(r)
                    print("total seconds:",r.elapsed.total_seconds())
                    num_frames += 1
                    print(
                        "Vision FPS (Vision System outflow): {}".format(
                            num_frames / (time.time() - past_time) # calculating FPS
                        )
                    )
        # display the undistorted camera view
        cv2.imshow("Tag Locations", undst)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
        elif (cv2.waitKey(1) & 0xFF == ord("p")):
            cv2.imwrite("./test/camera_capture/part3_capture.png", undst)
        else:
            continue


def parse_calibration_data(calib_file_name):
    """
    Parses the calibration file

    Returns an array of calculated values (scale factors, offsets, etc.)
    """
    calib_file, calib_data = util.read_json(calib_file_name)
    transform_matrix = util.get_numpy_matrix(calib_data, "transform_matrix")
    camera_matrix = util.get_numpy_matrix(calib_data, "camera_matrix")
    dist_coeffs = util.get_numpy_matrix(calib_data, "dist_coeffs")
    x_scale_factor = calib_data["scale_factors"]["x"]
    y_scale_factor = calib_data["scale_factors"]["y"]
    overall_center_x_offset = calib_data["overall_center_offset"]["x"]
    overall_center_y_offset = calib_data["overall_center_offset"]["y"]
    overall_angle_offset = calib_data["overall_center_offset"]["angle"]
    center_cell_offsets = calib_data["cell_center_offsets"]
    calib_file.close()
    return {
        "transform_matrix": transform_matrix,
        "camera_matrix": camera_matrix,
        "dist_coeffs": dist_coeffs,
        "x_scale_factor": x_scale_factor,
        "y_scale_factor": y_scale_factor,
        "overall_center_x_offset": overall_center_x_offset,
        "overall_center_y_offset": overall_center_y_offset,
        "overall_angle_offset": overall_angle_offset,
        "center_cell_offsets": center_cell_offsets
    }

def calc_tag_data(calib_data, detections):
    """
    Calculates the tag data (x, y, angle)

    Takes in a dictionary for calibration data, and the detections found via Detector()
    Outputs a list of data about the detected tags
    """

    snapshot_locations = []
    for i, d in enumerate(detections):
        
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
            calib_data["camera_matrix"], calib_data["dist_coeffs"], calib_data["transform_matrix"], d, TAG_SIZE
        )

        x_offset, y_offset, _ = get_x_y_angle_offsets(detected_x, detected_y, calib_data["center_cell_offsets"])
        x = calib_data["x_scale_factor"] * (detected_x + calib_data["overall_center_x_offset"]) + x_offset
        y = calib_data["y_scale_factor"] * (detected_y + calib_data["overall_center_y_offset"]) + y_offset
        z = detected_z

        angle = ((detected_angle + calib_data["overall_angle_offset"])%360)%360
        (ctr_x, ctr_y) = d.center

        # # prints DEVICE_ID tag id x y z angle
        snapshot_locations.append({"id": str(d.tag_id), "image_x": ctr_x, "image_y": ctr_y,"x": x, "y": y, "orientation": angle})
    return snapshot_locations

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
    transform_matrix_items = list(
        map(lambda x: float(x), temp_line[len("transform_matrix = ") :].split(" "))
    )
    transform_matrix = np.reshape(np.asarray(transform_matrix_items), (4, 4))
    return transform_matrix


def get_args():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(description="Locate and send Apriltag poses")

    parser.add_argument(
        "-u",
        "--url",
        metavar="<url>",
        type=str,
        required=False,
        help="URL to send data to",
    )

    parser.add_argument(
        "-f",
        "--file",
        metavar="<calib file name>",
        type=str,
        required=True,
        help=".calib file to use for un-distortion",
    )

    parser.add_argument(
        "-s",
        "--size",
        metavar="<size>",
        type=float,
        required=False,
        default=TAG_SIZE,
        help="size of tags to detect",
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

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    return args
    

def get_closest_reference_point_offset(x, y, center_cell_offsets):
    """ gets the reference point and its corresponding offsets that are closest to the detected point """
    try:
        return min(center_cell_offsets, key=lambda item: util.distance(x, y, item["reference_point_x"],item["reference_point_y"]))
    except:
        return None

def get_two_point_line_equation(x1, y1, x2, y2):
    """ computes the slope-intersect form of line between two points (x1,y1) and (x2,y2) """
    try:
        m = (y2-y1)/(x2-x1)
        b = m*(-x2)+y2
    except:
        print("here")
        m = 0
        b = (y1+y2)/2
    return lambda x: m*x + b


def linear_interpolation_with_2_ref_points(x1, y1, x2, y2, x):
    """given two points (x1,y1) and (x2,y2), computes y given any x"""
    #TODO: maybe rename? this could be used for exterpolation too
    linear_model = get_two_point_line_equation(x1, y1, x2, y2)
    return linear_model(x)

def get_x_y_angle_offsets(x, y, center_cell_offsets):

    closest_offsets = []
    remaining_offsets = center_cell_offsets[:]
    for i in range(4):
        closest_offsets.append(get_closest_reference_point_offset(x,y,remaining_offsets))
        remaining_offsets.pop(remaining_offsets.index(closest_offsets[i])) 
    
    right_offset = None
    left_offset = None
    closest_offset = closest_offsets[0]
    left_most_offset = min(closest_offsets[1:4], key=lambda offset: offset["reference_point_x"])
    left_most_offset_delta = abs(closest_offset["reference_point_x"] - left_most_offset["reference_point_x"])
    right_most_offset = max(closest_offsets[1:4], key=lambda offset: offset["reference_point_x"])
    right_most_offset_delta = abs(right_most_offset["reference_point_x"] - closest_offset["reference_point_x"])
    other_offset = util.complement_of_list(closest_offsets, [left_most_offset, closest_offset, right_most_offset])[0]
    if left_most_offset_delta > right_most_offset_delta:
        right_offset = closest_offset
        go_with_other = abs(left_most_offset["reference_point_y"]-y) > abs(other_offset["reference_point_y"]-y) and other_offset["reference_point_x"] < closest_offset["reference_point_x"]
        left_offset =  other_offset if go_with_other else left_most_offset
    else:
        left_offset = closest_offset
        go_with_other = abs(right_most_offset["reference_point_y"]-y) > abs(other_offset["reference_point_y"]-y) and other_offset["reference_point_x"] > closest_offset["reference_point_x"]
        right_offset = other_offset if go_with_other else right_most_offset

    x_offset = linear_interpolation_with_2_ref_data_points(x, "reference_point_x", "x_offset", left_offset, right_offset)
    x_offset = 0 if x_offset == None else x_offset

    
    top_offset = max(center_cell_offsets, key=lambda offset: offset["reference_point_y"])
    bottom_offset = min(center_cell_offsets, key=lambda offset: abs(offset["reference_point_y"] - y))
    
    
    bottom_offset = None
    top_offset = None
    closest_offset = closest_offsets[0]
    bottom_most_offset = min(closest_offsets[1:4], key=lambda offset: offset["reference_point_y"])
    bottom_most_offset_delta = abs(closest_offset["reference_point_y"]-bottom_most_offset["reference_point_y"])
    top_most_offset = max(closest_offsets[1:4], key=lambda offset: offset["reference_point_y"])
    top_most_offset_delta = abs(top_most_offset["reference_point_y"]-closest_offset["reference_point_y"])
    other_offset = util.complement_of_list(closest_offsets, [bottom_most_offset, closest_offset, top_most_offset])[0]
    if bottom_most_offset_delta > top_most_offset_delta:
        top_offset = closest_offset
        go_with_other = abs(bottom_most_offset["reference_point_x"]-x) > abs(other_offset["reference_point_x"]-x) and other_offset["reference_point_y"] < closest_offset["reference_point_y"] 
        bottom_offset = other_offset if go_with_other else bottom_most_offset
    else:
        bottom_offset = closest_offset
        go_with_other = abs(top_most_offset["reference_point_x"]-x) > abs(other_offset["reference_point_x"]-x) and other_offset["reference_point_y"] > closest_offset["reference_point_y"] 
        top_offset = other_offset if go_with_other else top_most_offset

    
    y_offset = linear_interpolation_with_2_ref_data_points(y, "reference_point_y", "y_offset", bottom_offset, top_offset)
    y_offset = 0 if y_offset == None else y_offset


    angle_offset_x = linear_interpolation_with_2_ref_data_points(x, "reference_point_x", "angle_offset", left_offset, right_offset)
    angle_offset_x = 0 if angle_offset_x == None else angle_offset_x

    angle_offset_y = linear_interpolation_with_2_ref_data_points(y, "reference_point_y", "angle_offset", bottom_offset, top_offset)
    angle_offset_y = 0 if angle_offset_y == None else angle_offset_y

    x_offsets_distance = distance_from_2_ref_data_points(x,y,"reference_point_x","reference_point_y", left_offset, right_offset)
    y_offsets_distance = distance_from_2_ref_data_points(x,y,"reference_point_x","reference_point_y", bottom_offset, top_offset)

    angle_offset = 0
    if x_offsets_distance != None and y_offsets_distance != None:
        angle_offset = util.weighted_average([angle_offset_x,angle_offset_y],[y_offsets_distance,x_offsets_distance])
    elif x_offsets_distance != None:
        angle_offset = angle_offset_x
    elif y_offsets_distance != None:
        angle_offset = angle_offset_y
    

    return (x_offset, y_offset, angle_offset)

def linear_interpolation_with_2_ref_data_points(independent_variable_input, independent_variable_property, dependent_property, reference_point_1, reference_point_2):
    result = None
    x1 = util.get_property_or_default(reference_point_1,independent_variable_property)
    y1 = util.get_property_or_default(reference_point_1,dependent_property)
    x2 = util.get_property_or_default(reference_point_2,independent_variable_property)
    y2 = util.get_property_or_default(reference_point_2,dependent_property)
    point1_exists = x1 != None and y1 != None
    point2_exists = x2 != None and y2 != None
    if point1_exists and point2_exists:
        result = linear_interpolation_with_2_ref_points(x1, y1, x2, y2, independent_variable_input)
    elif point1_exists:
        result = y1
    elif point2_exists:
        result = y2
    else:
        # print("neither point exists")
        pass
        
    return result

def distance_from_2_ref_data_points(independent_variable_input, dependent_variable_input, independent_variable_property, dependent_property, reference_point_1, reference_point_2):
    result = None
    x1 = util.get_property_or_default(reference_point_1,independent_variable_property)
    y1 = util.get_property_or_default(reference_point_1,dependent_property)
    x2 = util.get_property_or_default(reference_point_2,independent_variable_property)
    y2 = util.get_property_or_default(reference_point_2,dependent_property)
    point1_exists = x1 != None and y1 != None
    point2_exists = x2 != None and y2 != None
    if point1_exists and point2_exists:
        result = util.distance(independent_variable_input, dependent_variable_input, x1, y1) + \
         util.distance(independent_variable_input, dependent_variable_input, x2, y2)
    else:
        # print("a point doesn't exist")
        pass
        
    return result

def calculate_dimension():
    """ 
    Return the dimension of the checkerboard as (row length, column length)
    """
    args = get_args()
    TAG_SIZE = args["size"]
    cols, rows = args["cols"], args["rows"]

    dimension = [TAG_SIZE * rows, TAG_SIZE * cols]
    return dimension

def edge_fudge_factor_adjustments(x, y, x_offset, y_offset, angle_offset):
    """
    Return the adjusted offset for the tags close to the edges or at the edge of the checkboard
    """
    dimension = calculate_dimension()
    #cutoff is the percent of dimension we want to preserve
    cutoff = 0.8
    if (np.abs(x) > (cutoff * dimension[0])/2):
        x_offset = x_offset/4

    if (np.abs(y) > (cutoff * dimension[1])/2):
        y_offset = y_offset/4

    if (np.abs(x) > (cutoff * dimension[0])/2 and np.abs(y) > (cutoff * dimension[1])/2):
        angle_offset = angle_offset/4

    return x_offset, y_offset, angle_offset


if __name__ == "__main__":
    main()
