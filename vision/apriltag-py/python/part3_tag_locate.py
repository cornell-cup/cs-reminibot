import cv2
import argparse
import numpy as np
import sys
import time
import requests
import util
from detector import Detector
from platform import node as platform_node
from random import randint
from os import environ


# Constants
DEVICE_ID = 0  # The device the camera is, usually 0. TODO make this adjustable
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
# Arguments
# These are effectively constant after the argument parser has ran.
TAG_SIZE = 6.5 # The length of one side of an apriltag, in inches
SEND_DATA = True  # Sends data to URL if True. Set to False for debug


BASE_STATION_DEVICE_ID = hash(platform_node()+str(randint(0,1000000))+environ["USER"]+str(randint(0,1000000))+str(DEVICE_ID)+str(time.time()))

def main():
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
    FRAME_WIDTH  = camera.get(cv2.CAP_PROP_FRAME_WIDTH )   # float `width`
    FRAME_HEIGHT = camera.get(cv2.CAP_PROP_FRAME_HEIGHT)  # float `height`

    # Get matrices from calibration file
    print("Parsing calibration file " + calib_file_name + "...")
    predictors = util.get_predictors_with_calibration_file(calib_file_name)
    predict_x_offset = predictors["x_offsets_predictor"].predict
    predict_y_offset = predictors["y_offsets_predictor"].predict
    predict_x_offset_x_input_only = predictors["x_offsets_predictor_x_input_only"].predict
    predict_y_offset_y_input_only = predictors["y_offsets_predictor_y_input_only"].predict
    predict_angle_offset = predictors["angle_offsets_predictor"].predict
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
    while True:
        if not camera.isOpened():
            print("Failed to open camera")
            exit(0)

        # take a picture and get detections
        frame = util.get_image(camera)

        undst = util.undistort_image(frame, camera_matrix, dist_coeffs)
        gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)
        detections = []
        try:
            detections, det_image = detector.detect(gray, return_image=True)
        except Exception:
            pass


        print("Found " + str(len(detections)) + " apriltags")

        
        data_for_BS = {"DEVICE_ID": BASE_STATION_DEVICE_ID, "TIMESTAMP": time.time(), "DEVICE_CENTER_X": FRAME_WIDTH/2, "DEVICE_CENTER_Y": FRAME_HEIGHT/2, "position_data" : []}

        for i, d in enumerate(detections):
            # TODO draw tag - might be better to generalize, because
            # locate_cameras does this too.

            (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, transform_matrix, d, TAG_SIZE
            )

            # Scale the coordinates, and print for debugging
            # prints Device ID :: tag id :: x y z angle
            # TODO debug offset method - is better, but not perfect.
            center_cell_offset = get_closest_reference_point_offset(detected_x,detected_y,center_cell_offsets)

            x = x_scale_factor * (detected_x + overall_center_x_offset) + predict_x_offset((detected_x,detected_y))
            y = y_scale_factor * (detected_y + overall_center_y_offset) + predict_y_offset((detected_x,detected_y))
            z = detected_z
            angle = ((detected_angle + overall_angle_offset)%360 + predict_y_offset((detected_x,detected_y)))%360
            (ctr_x, ctr_y) = d.center
            
            # displaying tag id
            cv2.putText(undst, str(round(angle,2)),(int(ctr_x), int(ctr_y)), cv2.FONT_HERSHEY_SIMPLEX, .5,  (0, 0, 255),2)

            
            
           

            # prints DEVICE_ID tag id x y z angle
            print("{}, {},{},{},{},{}".format(BASE_STATION_DEVICE_ID, d.tag_id, x, y, z, angle))
            data_for_BS["position_data"].append({"id": d.tag_id, "image_x": ctr_x, "image_y": ctr_y,"x": x, "y": y, "orientation": angle})

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
                        num_frames / (time.time() - past_time)
                    )
                )
        cv2.imshow("Tag Locations", undst)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
        else:
            continue
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
        default=6.5,
        help="size of tags to detect",
    )

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    return args
    

def get_closest_reference_point_offset(x, y, center_cell_offsets):
    """ gets the reference point and its corresponding offsets that are closest to the detected point """
    return min(center_cell_offsets, key=lambda item: util.distance(x, y, item["reference_point_x"],item["reference_point_y"]))

if __name__ == "__main__":
    main()
