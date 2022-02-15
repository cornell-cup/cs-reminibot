import cv2
import apriltag
import argparse
import sys
import numpy as np
import time
import util
import json
import math

# PAPER_WIDTH = 8.5
# PAPER_HEIGHT = 11
# BOARD_TAG_SIZE = 6.5  # The length of a side of a tag on the axis board, in inches
# ORIGIN_TAG_SIZE = 6.5  # The length of a side of a tag used to calibrate the origin



def main():
    args = get_args()
    BOARD_TAG_SIZE = args["board"]
    # ORIGIN_TAG_SIZE = args["origin"]
    calib_file_name = args["calibration_file"]
    positions_file_name = args["positions_file"]
    COLUMNS = args["columns"]
    ROWS = args["rows"]
    NUM_DETECTIONS = COLUMNS * ROWS
    map_width = args["map_width"]
    map_height = args["map_height"]
    horizontal_distance_between_april_tags = (map_width - COLUMNS*BOARD_TAG_SIZE)/(1 if COLUMNS <= 1 else (COLUMNS - 1))
    vertical_distance_between_april_tags = (map_height - ROWS*BOARD_TAG_SIZE)/(1 if ROWS <= 1 else (ROWS - 1))

    #position file information takes precedence over rows and columns arguments
    positions_file, positions_data = None, None
    if positions_file_name != None:
        positions_file, positions_data = util.read_json(positions_file_name)
        NUM_DETECTIONS = len(positions_data)

    

    #FOR TESTING REMOVE LATER
    # middle_column, middle_row = get_middle_column_and_row(COLUMNS, ROWS)
    # print("id,x1,x2,y1,y2")
    # for id in range(NUM_DETECTIONS):
    #     x1,x2,y1,y2 = get_corner_coordinate_components(COLUMNS, ROWS, BOARD_TAG_SIZE, horizontal_distance_between_april_tags, vertical_distance_between_april_tags, id, middle_column, middle_row)
    #     print(str(id)+","+str(x1)+","+str(x2)+","+str(y1)+","+str(y2))
    #FOR TESTING REMOVE LATER
    
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
    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []
    img_points = np.ndarray((4 * NUM_DETECTIONS, 2))
    obj_points = np.ndarray((4 * NUM_DETECTIONS, 3))
    detections = []

    print(
        "The program will now attempt to detect the 4 tags on the axis calibration board"
    )
    print(
        "The four tags should have a red circle on their centers if detected properly."
    )
    print(
        "There will also be a blue circle in the middle of the 4 tags if 4 are detected."
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
        detections = get_filtered_detections(positions_file_name, positions_data, detector, gray)

        x_offset = 0
        y_offset = 0
        overall_x_center = 0
        overall_y_center = 0

        for i in range(len(detections)):
            d = detections[i]
            id = int(d.tag_id)
            

            # Add to offsets
            (ctr_x, ctr_y) = d.center
            x_offset += ctr_x
            y_offset += ctr_y
            overall_x_center += ctr_x
            overall_y_center += ctr_y

            # Draw onto the frame
            cv2.circle(undst, (int(ctr_x), int(ctr_y)), 5, (0, 0, 255), 3)
            pose, e0, e1 = detector.detection_pose(d, util.camera_matrix_to_camera_params(camera_matrix), BOARD_TAG_SIZE)
            util.draw_cube(undst,util.camera_matrix_to_camera_params(camera_matrix),BOARD_TAG_SIZE, pose)


        overall_x_center /= 1 if len(detections) == 0 else len(detections)
        overall_y_center /= 1 if len(detections) == 0 else len(detections)
        # Draw origin
        # if len(detections) == 4:
        #     cv2.circle(frame, (int(x_offset / 4), int(y_offset / 4)), 5, (255, 0, 0), 3)
        # Draw origin of more than 4 tags 
        cv2.circle(undst, (int(overall_x_center), int(overall_y_center)), 5, (255, 0, 0), 3)
        
        
        cv2.imshow("Calibration board", undst)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
    print("passed")
    cv2.destroyAllWindows()

    # Compute transformation via PnP
    # TODO What's the reasoning from this math?
    # This was from a tutorial somehwhere and was directly
    # transcribed from the C++ system.
    object_center_points = []
    object_angles = []
    middle_column, middle_row = get_middle_column_and_row(COLUMNS, ROWS)
    


    #detections = detections if positions_file_name == None else [detection for detection in detections if get_position_with_id(positions_data, detection.tag_id) != None]
    for i, d in enumerate(detections):
        if i >= NUM_DETECTIONS:
            print(f"Waring:\nToo many tags detected. tags with id: {id} will be ignored")
            continue

        id = int(d.tag_id)
        img_points[0 + 4 * i] = d.corners[0]
        img_points[1 + 4 * i] = d.corners[1]
        img_points[2 + 4 * i] = d.corners[2]
        img_points[3 + 4 * i] = d.corners[3]
        # print("corner: ",d.corners[0])
        if positions_file_name == None:
            x1, x2, y1, y2 = get_corner_coordinate_components(COLUMNS, ROWS, BOARD_TAG_SIZE, horizontal_distance_between_april_tags, vertical_distance_between_april_tags, id, middle_column, middle_row)
            # DEPRECATED: old code doesn't account for rotation
            object_center_points.append(((x1+x2)/2, (y1+y2)/2))
            obj_points[0 + 4 * i] = [x1, y1, 0]
            obj_points[1 + 4 * i] = [x2, y1, 0]
            obj_points[2 + 4 * i] = [x2, y2, 0]
            obj_points[3 + 4 * i] = [x1, y2, 0]
        else:
            position = get_position_with_id(positions_data, id)
            if position == None:
                print(f"Waring:\nid: {id} not found in {positions_file_name}")
                continue
            print(f"position: {position}")
            center_x = position["x"]
            center_y = position["y"]
            object_center_points.append((center_x, center_y))
            angle = position["angle"]
            object_angles.append(angle)
            
            unrotated_corner_vectors = [np.array([[-BOARD_TAG_SIZE/2],[-BOARD_TAG_SIZE/2]]), np.array([[BOARD_TAG_SIZE/2],[-BOARD_TAG_SIZE/2]]), np.array([[BOARD_TAG_SIZE/2],[BOARD_TAG_SIZE/2]]), np.array([[-BOARD_TAG_SIZE/2],[BOARD_TAG_SIZE/2]])]
            angle_in_radians = math.pi*angle/180
            rotation_matrix = np.array([[math.cos(angle_in_radians), -math.sin(angle_in_radians)],[math.sin(angle_in_radians),math.cos(angle_in_radians)]])
            for index, unrotated_corner_vector  in enumerate(unrotated_corner_vectors):
                rotated_corner_vector = np.matmul(rotation_matrix,unrotated_corner_vector)
                obj_points[index + 4 * i] = [center_x+rotated_corner_vector[0][0], center_y+rotated_corner_vector[1][0], 0]
                print("obj_points",obj_points)
        

        # print(str(id)+","+str(x1)+","+str(y1)+","+str(x2)+","+str(y2))

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

    # Compute offsets via new calibration process
    print("Axis calibration was successful!")
    print(
        "We will now center the camera. Place any apriltag where you would \
        like (0,0) to be."
    )
    print(
        "A blue dot will appear in the center of the tag you placed to help \
        show where (0,0) will be set to."
    )
    print("When you have your tag in the right place, press SPACE.")

    while True:
        # Locate tag for use as origin
        frame = util.get_image(camera)
        undst = util.undistort_image(frame, camera_matrix, dist_coeffs)
        gray = cv2.cvtColor(undst, cv2.COLOR_BGR2GRAY)
        detections = get_filtered_detections(positions_file_name, positions_data, detector, gray)

        if len(detections) == 0:
            continue
        
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

        detected_xs, detected_ys, x_offsets, y_offsets, angle_offsets = get_cell_offsets_with_original_detections(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin, center_x_offset, center_y_offset, angle_offset, x_scale_factor, y_scale_factor)



        # Write offsets new
        calib_data["cell_center_offsets"] = [{
            "reference_point_x": detected_xs[detection_index],
            "reference_point_y": detected_ys[detection_index],
            "x_offset": x_offsets[detection_index],
            "y_offset": y_offsets[detection_index],
            "angle_offset": angle_offsets[detection_index]
        } for detection_index in range(len(detections)) if True] 
          
        
        cv2.circle(undst, (int(overall_x_center), int(overall_y_center)), 5, (255, 0, 0), 3)

        cv2.imshow("Origin tag", undst)
        if cv2.waitKey(1) & 0xFF == ord(" "):
            break
        else:
            continue

    
    with open(calib_file_name, "w") as calib_file:
        json.dump(calib_data, calib_file)

    print("Finished writing data to calibration file")
    pass


def get_filtered_detections(positions_file_name, positions_data, detector, gray):
    detections, det_image = detector.detect(gray, return_image=True)

    if positions_file_name != None:
        detections = filter_detections_from_file(positions_data, detections)
    return detections

def filter_detections_from_file(positions_data, detections):
    filtered_detections = []
    for detection in detections:
        if get_position_with_id(positions_data, detection.tag_id) != None:
            filtered_detections.append(detection)
    detections = filtered_detections
    return detections

def get_position_with_id(positions_data, id):
    found_positions = [item for item in positions_data if int(item["id"]) == id]
    return found_positions[0] if found_positions else None

def get_cell_offsets_with_original_detections(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin, center_x_offset, center_y_offset, angle_offset, x_scale_factor, y_scale_factor):
    #These will store the scaled points with fudge factors that move the detected center point of each
    #april tag closer to the ideal center point. 
    x_offsets = []
    y_offsets = []
    angle_offsets = []
    detected_xs = []
    detected_ys = []
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
        angle_offsets.append((actual_angle - offset_detected_angle) if abs(actual_angle - offset_detected_angle) <= 180 else (actual_angle - offset_detected_angle)%math.copysign(180,offset_detected_angle - actual_angle))
        detected_xs.append(detected_x)
        detected_ys.append(detected_y)
    return detected_xs, detected_ys, x_offsets, y_offsets, angle_offsets

def get_world_scale_factors(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, camera_to_origin, center_x_offset, center_y_offset):
    #Store the scale factor for every set of points (x,y) in these lists
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

        #A general scale factor for every point calculated using the average of the individual scale factors
    x_scale_factor = sum(x_scale_factors)/len(x_scale_factors)
    y_scale_factor = sum(y_scale_factors)/len(y_scale_factors)
    return x_scale_factor,y_scale_factor

def get_world_center_offsets(BOARD_TAG_SIZE, camera_matrix, dist_coeffs, detections, object_center_points, object_angles, camera_to_origin):
    actual_x_coords = []
    actual_y_coords = []
    detected_x_coords = []
    detected_y_coords = []
    detected_angles = []
    angle_differences = []
    max_id = -1
    for detection_index in range(len(detections)):
        (detected_x, detected_y, detected_z, detected_angle) = util.compute_tag_undistorted_pose(
                camera_matrix, dist_coeffs, camera_to_origin, detections[detection_index], BOARD_TAG_SIZE
            )
        (actual_x, actual_y) = object_center_points[detection_index]
        actual_angle = object_angles[detection_index]
        max_id = int(detections[detection_index].tag_id) if int(detections[detection_index].tag_id) > max_id else max_id
        actual_x_coords.append(actual_x)
        actual_y_coords.append(actual_y)    
        detected_x_coords.append(detected_x)
        detected_y_coords.append(detected_y)
        detected_angles.append(detected_angle)
        #print("angle diff",str(detections[detection_index].tag_id)+":",str((actual_angle-detected_angle) if abs(actual_angle-detected_angle) <= 180 else (actual_angle-detected_angle)%math.copysign(180,detected_angle-actual_angle)))
        angle_differences.append((actual_angle-detected_angle) if abs(actual_angle-detected_angle) <= 180 else (actual_angle-detected_angle)%math.copysign(180,detected_angle-actual_angle) )

        # Center_x_offset is the actual coordinate the of center of all the detected x values, and it will be used
        # to offset all the other points. We do this because we are treating the center of all detected x values
        # as the origin of our coordinate plane.
        # Center_y_offset is the same thing. Both of these values are negative so we can add it to other coordinates,
        # which generally come with very large values.      
    center_x_offset = (sum(actual_x_coords)-sum(detected_x_coords))/len(detected_x_coords)
    center_y_offset = (sum(actual_y_coords)-sum(detected_y_coords))/len(detected_y_coords)
    angle_offset = (sum(angle_differences)/len(detected_angles))
    return center_x_offset,center_y_offset,angle_offset

def get_middle_column_and_row(COLUMNS, ROWS):
    middle_column = (COLUMNS - 1)//2
    middle_row = (ROWS - 1)//2
    return middle_column, middle_row

def get_corner_coordinate_components(COLUMNS, ROWS, BOARD_TAG_SIZE, horizontal_distance_between_april_tags, vertical_distance_between_april_tags, id, middle_column, middle_row):
    
    x1,x2,y1,y2 = 0, 0, 0, 0
    column = id % COLUMNS
    row = id // COLUMNS

    #calculating x components of corners
    horizontal_distance_between_april_tags_from_center = (column - middle_column)
    BOARD_TAGs_from_center = horizontal_distance_between_april_tags_from_center+.5
    even_column_offset = -(horizontal_distance_between_april_tags+BOARD_TAG_SIZE)/2 * (1-COLUMNS%2)
    x2 = horizontal_distance_between_april_tags * horizontal_distance_between_april_tags_from_center + (BOARD_TAGs_from_center)*BOARD_TAG_SIZE + even_column_offset
    x1 = x2 - BOARD_TAG_SIZE

    #calculating y components of corners
    vertical_distance_between_april_tags_from_center = (middle_row - row)
    BOARD_TAGs_from_center = vertical_distance_between_april_tags_from_center+.5
    even_row_offset = (vertical_distance_between_april_tags+BOARD_TAG_SIZE)/2 * (1-ROWS%2)
    y2 = vertical_distance_between_april_tags * vertical_distance_between_april_tags_from_center + (BOARD_TAGs_from_center)*BOARD_TAG_SIZE + even_row_offset
    y1 = y2 - BOARD_TAG_SIZE

    return x1,x2,y1,y2

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
        "-r",
        "--rows",
        metavar="<number of rows in map>",
        type=int,
        required=False,
        default=3,
        help="number of rows of april tags in your april tag map",
    )

    parser.add_argument(
        "-c",
        "--columns",
        metavar="<number of columns in map>",
        type=int,
        required=False,
        default=8,
        help="number of columns of april tags in your april tag map",
    )

    # parser.add_argument(
    #     "-o",
    #     "--origin",
    #     metavar="<origin tag size>",
    #     type=float,
    #     required=False,
    #     default=6.5,
    #     help="size of one side of the tag to calibrate \
    #                         the origin, in inches",
    # )

    parser.add_argument(
        "-pf",
        "--positions_file",
        metavar="<tag positions file name>",
        type=str,
        required=False,
        default=None,
        help="JSON file containg positions \
                            of the april tags for calibration",
    )

    parser.add_argument(
        "-mw",
        "--map_width",
        metavar="<width of map>",
        type=float,
        required=False,
        default=2,
        help="horizontal distance between the left edge of one of the leftmost april \
            tag and the right edge of one of the rightmost april tag in inches. \
            NOTE: For and accurate calibration: \
            Measure from the edge of the april tags pattern itself, not the ege of the paper. \
            The tags must be in evenly spaced rows in columns. \
            The tag ids increase by 1 as they go from left to right and downwards \
            The map_height argument (--map_height <height of map>) must be specified",
    )

    parser.add_argument(
        "-mh",
        "--map_height",
        metavar="<vertical distance of the \
            outer edges of the april tag map in inches>",
        type=float,
        required=False,
        default=4.5,
        help="vertical distance between the top edge of one of the topmost april \
            tag and the bottom edge of one of the bottommost april tag in inches. \
            NOTE: For and accurate calibration: \
            Measure from the edge of the april tags pattern itself, not the ege of the paper. \
            The tags must be in evenly spaced rows in columns. \
            The tag ids increase by 1 as they go from left to right and downwards \
            The map_width argument (--map_width <width of map>) must be specified",
    )

    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed
    return args


if __name__ == "__main__":
    main()
