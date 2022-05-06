import cv2
import argparse
import sys
import numpy as np
import time
import util
import json
import math
from detector import Detector
from detection import Detection


MAX_DETECTOR_SNAPSHOTS = 100


def main():
    args = get_args()
    BOARD_TAG_SIZE = args["board"]
    calib_file_name = args["calibration_file"]
    positions_file_name = args["positions_file"]
    positions_file, positions_data = util.read_json(positions_file_name)
    NUM_DETECTIONS = len(positions_data)

    


    
    # offsets to reposition where (0,0) is
    x_offset = 0
    y_offset = 0

    camera = util.get_camera(0)

    # Get matrices from file
    calib_file, calib_data = util.read_json(calib_file_name)
    camera_matrix = util.get_numpy_matrix(calib_data, "camera_matrix")
    dist_coeffs = util.get_numpy_matrix(calib_data, "dist_coeffs")
    new_mat = util.get_numpy_matrix(calib_data, "new_camera_matrix")
    calib_file.close()
    print("Read from calibration file")
    print("CAMERA MATRIX: {}".format(camera_matrix))
    print("DIST COEFFS: {}".format(dist_coeffs))
    print()

    

    # Initialize the detector
    detector = Detector()

    frame = []
    gray = []
    img_points = np.ndarray((4 * NUM_DETECTIONS, 2))
    obj_points = np.ndarray((4 * NUM_DETECTIONS, 3))
    detections = []

    print(
        "The program will now attempt to detect the tags on the calibration board"
    )
    print(
        "The tags should have a red circle on their centers if detected properly."
    )
    print(
        "There will also be a blue circle in the middle of the tags if they are detected."
    )
    print("Align the blue dot with the middle of the screen.")
    print("Then, press SPACE.")
    while True:
        frame = util.get_image(camera)  # take a new picture

        # For weird reasons, anti-distortion measures WORSENED the problem,
        # so they have been removed. If you need to put them back,
        # this is the place for it.
        undst = util.undistort_image(frame, camera_matrix, dist_coeffs)
        # Convert undistorted image to grayscale
        gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)

        # Use the detector and compute useful values from it
        iteration_detections = get_filtered_detections(positions_file_name, positions_data, detector, gray)

        img_points = np.ndarray((4 * len(detections), 2))
        obj_points = np.ndarray((4 * len(detections), 3))

        if len(detections) > NUM_DETECTIONS:
            print("WARNING: Too many calibration apriltags detected based on position file:",positions_file_name)
        elif len(detections) < NUM_DETECTIONS:
            print("WARNING: Not enough calibration apriltags detected based on position file:",positions_file_name)

        x_offset = 0
        y_offset = 0
        overall_x_center = 0
        overall_y_center = 0

        for i in range(len(iteration_detections)):
            d = iteration_detections[i]
            id = int(d.tag_id)
            

            # Add to offsets
            (ctr_x, ctr_y) = d.center
            x_offset += ctr_x
            y_offset += ctr_y
            overall_x_center += ctr_x
            overall_y_center += ctr_y

            # Draw onto the frame
            cv2.circle(undst, (int(ctr_x), int(ctr_y)), 5, (0, 0, 255), 3)

            

        overall_x_center /= 1 if len(iteration_detections) == 0 else len(iteration_detections)
        overall_y_center /= 1 if len(iteration_detections) == 0 else len(iteration_detections)
        
        cv2.circle(undst, (int(overall_x_center), int(overall_y_center)), 5, (255, 0, 0), 3)
        
        
        cv2.imshow("Calibration board", undst)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
    print("passed")
    cv2.destroyAllWindows()

    iteration_detections_history = []
    discovered_ids = set()
    for iteration in range(MAX_DETECTOR_SNAPSHOTS):
        frame = util.get_image(camera)  # take a new picture

        # For weird reasons, anti-distortion measures WORSENED the problem,
        # so they have been removed. If you need to put them back,
        # this is the place for it.
        undst = util.undistort_image(frame, camera_matrix, dist_coeffs)
        # Convert undistorted image to grayscale
        gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)

        # Use the detector and compute useful values from it
        iteration_detections = get_filtered_detections(positions_file_name, positions_data, detector, gray)

        iteration_detections_history += [detection.to_dict() for detection in iteration_detections]
        discovered_ids.update([detection.tag_id for detection in iteration_detections])
    
    for id in discovered_ids:
        detections_with_id = [detection for detection in iteration_detections_history if detection["id"] == id]
        detections.append(Detection.from_dict({
                "id": id, 
                "center_x": util.average_value_for_key(detections_with_id, "center_x",True,1),
                "center_y": util.average_value_for_key(detections_with_id, "center_y",True,1),
                "corner_0_x": util.average_value_for_key(detections_with_id, "corner_0_x",True,1), 
                "corner_0_y": util.average_value_for_key(detections_with_id, "corner_0_y",True,1), 
                "corner_1_x": util.average_value_for_key(detections_with_id, "corner_1_x",True,1), 
                "corner_1_y": util.average_value_for_key(detections_with_id, "corner_1_y",True,1), 
                "corner_2_x": util.average_value_for_key(detections_with_id, "corner_2_x",True,1), 
                "corner_2_y": util.average_value_for_key(detections_with_id, "corner_2_y",True,1), 
                "corner_3_x": util.average_value_for_key(detections_with_id, "corner_3_x",True,1), 
                "corner_3_y": util.average_value_for_key(detections_with_id, "corner_3_y",True,1), 
                "angle": util.average_value_for_key(detections_with_id, "angle",True,1)%360
        }))



    img_points = np.ndarray((4 * len(detections), 2))
    obj_points = np.ndarray((4 * len(detections), 3))

    # Compute transformation via PnP
    # TODO What's the reasoning from this math?
    # This was from a tutorial somehwhere and was directly
    # transcribed from the C++ system.
    object_center_points = []
    object_angles = []
    for i, d in enumerate(detections):
        if i >= NUM_DETECTIONS:
            print(f"Waring:\nToo many tags detected. tags with id: {id} will be ignored")
            continue

        id = int(d.tag_id)
        img_points[0 + 4 * i] = d.corners[0]
        img_points[1 + 4 * i] = d.corners[1]
        img_points[2 + 4 * i] = d.corners[2]
        img_points[3 + 4 * i] = d.corners[3]
        
        position = get_position_with_id(positions_data, id)
        if position == None:
            print(f"Waring:\nid: {id} not found in {positions_file_name}")
            continue
        center_x = position["x"]
        center_y = position["y"]
        object_center_points.append((center_x, center_y))
        angle = position["angle"]
        object_angles.append(angle%360)
        
        unrotated_corner_vectors = [np.array([[-BOARD_TAG_SIZE/2],[-BOARD_TAG_SIZE/2]]), np.array([[BOARD_TAG_SIZE/2],[-BOARD_TAG_SIZE/2]]), np.array([[BOARD_TAG_SIZE/2],[BOARD_TAG_SIZE/2]]), np.array([[-BOARD_TAG_SIZE/2],[BOARD_TAG_SIZE/2]])]
        angle_in_radians = math.pi*angle/180
        rotation_matrix = np.array([[math.cos(angle_in_radians), -math.sin(angle_in_radians)],[math.sin(angle_in_radians),math.cos(angle_in_radians)]])
        for index, unrotated_corner_vector  in enumerate(unrotated_corner_vectors):
            rotated_corner_vector = np.matmul(rotation_matrix,unrotated_corner_vector)
            obj_points[index + 4 * i] = [center_x+rotated_corner_vector[0][0], center_y+rotated_corner_vector[1][0], 0]
        

    # Make transform matrices
    pose = cv2.solvePnP(obj_points, img_points, camera_matrix, dist_coeffs)
    ret, rvec, tvec = pose
    dst, jac = cv2.Rodrigues(rvec)



    # Make origin to camera matrix
    """
    The origin_to_camera matrix looks like this:

    dst[0,0] dst[0,1] dst[0,2] tvec[0,0]
    dst[1,0] dst[1,1] dst[1,2] tvec[1,0]
    dst[2,0] dst[2,1] dst[2,2] tvec[2,0]
    0           0       0       1
    """
    temp = np.append(dst, tvec, axis=1)
    temp = np.append(temp, np.array([[0, 0, 0, 1]]), axis=0)
    origin_to_camera = np.asmatrix(temp)
    camera_to_origin = np.linalg.inv(origin_to_camera)
    print("CAMERA TO ORIGIN: {}".format(camera_to_origin))

    # Generate the location of the camera
    # Seems to use a homogenous coordinates system (x,y,z,k)
    gen_out = np.array([0, 0, 0, 1]).T
    camera_coordinates = np.matmul(camera_to_origin, gen_out)
    print("CAMERA COORDINATES: {}".format(camera_coordinates))

    # write matrix to file
    calib_data["transform_matrix"] = camera_to_origin.tolist()
    with open(calib_file_name, "w") as calib_file:
        json.dump(calib_data, calib_file)


        
    detected_xs, detected_ys = get_detected_xs_ys(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin)

    center_x_offset, center_y_offset, angle_offset = get_world_center_offsets(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin)
    calib_data["overall_center_offset"] = {
        "x": center_x_offset,
        "y": center_y_offset,
        "angle": angle_offset
    }

    
    x_scale_factor, y_scale_factor = get_world_scale_factors(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, camera_to_origin, center_x_offset, center_y_offset)
    calib_data["scale_factors"] = {
        "x": x_scale_factor,
        "y": y_scale_factor
    }

    x_offsets, y_offsets, angle_offsets = get_cell_offsets(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin, center_x_offset, center_y_offset, angle_offset, x_scale_factor, y_scale_factor)



    # Write offsets new
    calib_data["cell_center_offsets"] = [{
        "reference_point_x": detected_xs[detection_index],
        "reference_point_y": detected_ys[detection_index],
        "x_offset": x_offsets[detection_index],
        "y_offset": y_offsets[detection_index],
        "angle_offset": angle_offsets[detection_index]
    } for detection_index in range(len(detections)) if True] 
        
    
    cv2.circle(undst, (int(overall_x_center), int(overall_y_center)), 5, (255, 0, 0), 3)

    

    
    with open(calib_file_name, "w") as calib_file:
        json.dump(calib_data, calib_file)

    print("Finished writing data to calibration file")
    pass


def get_filtered_detections(positions_file_name, positions_data, detector, gray):
    """ returns a list of the apriltag detections that correspond with the position file """
    detections, det_image = detector.detect(gray, return_image=True)
    if positions_file_name != None:
        detections = filter_detections_from_file(positions_data, detections)
    
    return detections

def filter_detections_from_file(positions_data, detections):
    """ filters detection list to return a list of only the apriltag detections that correspond with the position file """
    filtered_detections = []
    detected_ids = []
    for detection in detections:
        if get_position_with_id(positions_data, detection.tag_id) != None and not (detection.tag_id in detected_ids):
            filtered_detections.append(detection)
            detected_ids.append(detection.tag_id)
    detections = filtered_detections
    return detections

def get_position_with_id(positions_data, id):
    """ returns the ideal position corresponding to the given id as defined by the position file """
    found_positions = [item for item in positions_data if int(item["id"]) == id]
    return found_positions[0] if found_positions else None


def get_detected_xs_ys(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin):
    """ returns a list of the detected x coordinates and a list of the detected y coordinates for the given list of detected apriltags """
    detected_xs = []
    detected_ys = []
    for detection_index in range(len(detections)):
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, camera_to_origin, detections[detection_index], BOARD_TAG_SIZE
            )
        detected_xs.append(detected_x)
        detected_ys.append(detected_y)
    return detected_xs, detected_ys

def get_cell_offsets(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin, center_x_offset, center_y_offset, angle_offset, x_scale_factor, y_scale_factor):
    """ returns a list of the x offsets (fudge factors), a list of the y offsets (fudge factors), and a list of the angle offsets (fudge factors) for each individual cell in order to convert detected points to the world points"""
    x_offsets = []
    y_offsets = []
    angle_offsets = []
    for detection_index in range(len(detections)):
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, camera_to_origin, detections[detection_index], BOARD_TAG_SIZE
            )
            
        (actual_x, actual_y) = object_center_points[detection_index]
        actual_angle = object_angles[detection_index]
        center_offset_detected_x = detected_x+center_x_offset
        center_offset_detected_y = detected_y+center_y_offset
        offset_detected_angle = (detected_angle+angle_offset)%360
        x_offsets.append(actual_x - x_scale_factor*center_offset_detected_x)
        y_offsets.append(actual_y - y_scale_factor*center_offset_detected_y)
        angle_offsets.append((actual_angle - offset_detected_angle)%360)
    return x_offsets, y_offsets, angle_offsets

def get_world_scale_factors(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, camera_to_origin, center_x_offset, center_y_offset):
    """ returns the x scale factor and the y scale factor for converting detected points to world points """
    x_scale_factors = []
    y_scale_factors = []
    for detection_index in range(len(detections)):
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, camera_to_origin, detections[detection_index], BOARD_TAG_SIZE
            )
        (actual_x, actual_y) = object_center_points[detection_index]
        center_offset_detected_x = detected_x+center_x_offset
        center_offset_detected_y = detected_y+center_y_offset
        if actual_x != 0 and detected_x != 0:
            x_scale_factors.append(actual_x/center_offset_detected_x)
        if actual_y != 0 and detected_y != 0:
            y_scale_factors.append(actual_y/center_offset_detected_y)

    x_scale_factor = sum(x_scale_factors)/len(x_scale_factors)
    y_scale_factor = sum(y_scale_factors)/len(y_scale_factors)

    return x_scale_factor,y_scale_factor

def get_world_center_offsets(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin):
    """ returns the single x offset, y offset, and angle offset to put the origin of the world points in the correct location and ensure the correct orientation """
    actual_x_coords = []
    actual_y_coords = []
    detected_x_coords = []
    detected_y_coords = []
    detected_angles = []
    angle_differences = []

    for detection_index in range(len(detections)):
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, camera_to_origin, detections[detection_index], BOARD_TAG_SIZE
            )
        (actual_x, actual_y) = object_center_points[detection_index]
        actual_angle = object_angles[detection_index]
        actual_x_coords.append(actual_x)
        actual_y_coords.append(actual_y)    
        detected_x_coords.append(detected_x)
        detected_y_coords.append(detected_y)
        detected_angles.append(detected_angle)
        angle_difference = (actual_angle-detected_angle) %360
        angle_differences.append(angle_difference )
    center_x_offset = (sum(actual_x_coords)-sum(detected_x_coords))/len(detected_x_coords)
    center_y_offset = (sum(actual_y_coords)-sum(detected_y_coords))/len(detected_y_coords)
    angle_offset = (sum(angle_differences)/len(detected_angles))
    return center_x_offset,center_y_offset,angle_offset

def get_args():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(description="Calibrate camera axes")

    parser.add_argument(
        "-cf",
        "--calibration_file",
        metavar="<calibration file name>",
        type=str,
        required=True,
        help=".calib file to use for un-distortion",
    )

    parser.add_argument(
        "-b",
        "--board",
        metavar="<board tag size>",
        type=float,
        required=True,
        default=6.5,
        help="size of one side of a tag on the axis calibration \
                            board, in inches",
    )

    parser.add_argument(
        "-pf",
        "--positions_file",
        metavar="<tag positions file name>",
        type=str,
        required=True,
        default=None,
        help="JSON file containg positions \
                            of the april tags for calibration",
    )

    

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed
    return args


if __name__ == "__main__":
    main()
