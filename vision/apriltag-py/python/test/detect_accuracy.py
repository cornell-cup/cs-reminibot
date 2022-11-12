import cv2
import numpy as np
import util.apriltag as apriltag
import argparse
import time
import util.util as util
import itertools
import statistics
import sys
import types

"""
Shows a video to detect tags live.

Interesting notes:

DETECT_TAGS SHOW_IMAGE  STABLE FPS
False       False       30
False       True        4-5


This DOES NOT include any overhead that our vision
system may add.
"""

# Configuration Options
SHOW_IMAGE = True
PRINT_FPS = False
APPLY_CHECKERBOARD = True
APPLY_TRANSFORM = False
# This tag is used as a canonical distance conversion
CANONICAL_TAG = 11
# Tag size is 6.25" with 8.5" expected width spacing and 11" expected height spacing
TAG_SIZE = 6.25
# Scale factor of output coordinates
MULT_FACTOR = 5  
# 8.5 and 11 are dimensions of paper size because the tag is printed 
# on letter paper
TAG_WIDTH = 8.5
TAG_HEIGHT = 11
# Colors for grid drawing
BLUE = (66, 245, 206)
YELLOW = (245, 182, 66)


def main():
    args = get_args()
    cols = args["cols"] 
    rows = args["rows"]
    camera = util.get_camera(args["index"])
    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    start = time.time()
    frame_num = 0
    window = cv2.namedWindow("frame")
    while True:
        if PRINT_FPS:
            frame_num += 1
        ret, frame = camera.read()
        if SHOW_IMAGE:
            cv2.imshow("frame", frame)
        if PRINT_FPS:
            fps = frame_num / (time.time() - start)
            print("Showing frame {}".format(frame_num))
            print("Current speed: {} fps".format(fps))
        if APPLY_CHECKERBOARD:
            frame = undistort_image(frame, args["file"])
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        detections, det_image = detector.detect(gray, return_image=True)
        print(len(detections))
        if detections and APPLY_TRANSFORM:
            detections = apply_transform(detections, args["file"])
        points = []
        dim_lst = []
        for d in range(len(detections)):
            tag_x, tag_y = detections[d].center
            center_point = (int(tag_x), int(tag_y))
            points.append(center_point)
            cp = get_point(detections[d].center)
            tl = get_point(detections[d].corners[0])
            tr = get_point(detections[d].corners[1])
            br = get_point(detections[d].corners[2])
            x_axis = (tl[0] + tr[0]) // 2, (tl[1] + tr[1]) // 2
            y_axis = (tr[0] + br[0]) // 2, (tr[1] + br[1]) // 2
            # print("Tag {} found at ({},{})".format(d.tag_id, tag_x, tag_y))
            # print("with angle {}".format(util.get_tag_angle(d.corners)))

            # Compute size of each tag as they appear on camera
            tl = get_point(detections[d].corners[0])
            tr = get_point(detections[d].corners[1])
            br = get_point(detections[d].corners[2])

            width = dist(tr, tl)
            height = dist(tr, br)
            dim = np.array([width, height])
            dim_lst.append(dim)

        compute_dx_dy_all(frame, detections, points, dim_lst, rows, cols, CANONICAL_TAG)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    camera.release()
    cv2.destroyAllWindows()
    pass


def compute_dx_dy_all(img, detections, points, dim_lst, rows, cols, CANONICAL_TAG = None):
    """
    Computes the horizontal distance (dx) and 
    vertical distance (dy) between the center of each tag and
    prints the results. When CANONICAL_TAG is not None, draws a rectangle of the 
    same size as canonical tag centered at the center of each tag in the mat and 
    the computes dx and dy relative to the size of the canonical tag. If not all
    tags in tag mat are detected, prints "Not enough tag in detections" message.

    Parameters:
    img - image that captures the tag mat;
    detections - list of tags detected;
    points - list of detected tags' center points;
    dim_lst - list of detected tags' (width, height) dimension tuple ;
    rows - number of rows in the tag mat; 
    cols - number of cols in the tag mat;
    CANONICAL_TAG - a tag from detections;
    
    Precondition:
    rows, cols are integers > 0
    """
    if len(detections) == rows * cols:
        # Compute diffs in x and y for tag mat
        dx, dy = (
            compute_diffs(points, rows, cols)
            if CANONICAL_TAG is None
            else compute_canonical_diffs(img, detections, points, rows, cols, CANONICAL_TAG)
        )
        dim_lst = np.array(dim_lst)
        widths = [l[0] for l in dim_lst]
        heights = [h[1] for h in dim_lst]
        if CANONICAL_TAG is not None:
            X, Y = 0, 1
            tag = detections[CANONICAL_TAG]
            w_c = abs(tag.corners[0][X] - tag.corners[1][X])
            h_c = abs(tag.corners[1][Y] - tag.corners[2][Y])
        else:
            w_c = statistics.mean(widths)
            h_c = statistics.mean(heights)
        x_dist = w_c * TAG_WIDTH / TAG_SIZE
        y_dist = h_c * TAG_HEIGHT / TAG_SIZE
        
        # print stats
        print("POSITIONS")
        print(
            "dx: {}\ndy: {}\nx_m: {} y_m: {}".format(
                None, None, max(dx) - min(dx), max(dy) - min(dy)
            )
        )
        print("Percent Error X: {}% | Percent Error Y: {}%".format(
            100 * statistics.mean(dx) / x_dist, 100 * statistics.mean(dy) / y_dist
        ))

        # Compute stats for dim_lst
        print("TAG DIMENSIONS")
        print(
            "dimension (w x h): \nmax_diff_w: {} max_diff_h: {}".format(
                max(dim_lst[:, 0]) - min(dim_lst[:, 0]),
                max(dim_lst[:, 1]) - min(dim_lst[:, 1]),
            )
        )
        # print("Widths: {}".format(widths))
        # print("Heights: {}".format(heights))
        print("Median width: {}".format(statistics.median(widths)))
        print("Median height: {}".format(statistics.median(heights)))
        print("Percent Errors | width {}% | height {}%".format(
            100 * statistics.mean([(w - w_c) / w_c for w in widths]),
            100 * statistics.mean([(h - h_c) / h_c for h in heights])
        ))
        print("Std. Deviations | width {} | height {}".format(
            statistics.stdev(widths), statistics.stdev(heights)
        ))
    else:
        print("Not enough tag in detections")


def compute_diffs(points, rows, cols):
    """
    Computes vertical and horizontal differences between each observed point's
    location.

    Returns:
    Two lists of vertical and horizontal differences

    Parameters:
    points - list of tags' centers
    rows - number of rows of the tag mat
    cols - number of columns of the tag mat
    
    Precondition:
    rows, cols are integers > 0
    """
    dx, dy = [], []
    x_pts = [p[0] for p in points]
    y_pts = [p[1] for p in points]
    for col in range(cols - 1):
        for row in range(rows):
            dx.append(x_pts[cols * row + col + 1] - x_pts[cols * row + col])
    y_chunks = [y_pts[(cols * c) : (cols * (c + 1))] for c in range(rows)]
    for c in range(rows - 1):
        dy.extend([p[1] - p[0] for p in zip(y_chunks[c], y_chunks[c + 1])])
    return dx, dy


def compute_canonical_diffs(img, detections, points, rows, cols, CANONICAL_TAG):
    """
    Computes the difference between observed dx, dy and expected dx, dy using 
    canonical tag as the reference height and width. 
    
    Returns:
    list of dx and list of dy.
    
    Parameters:
    img - image that captures the tag mat
    detections - list of tags detected
    points - list of detected tags' center points
    rows - number of rows in the tag mat 
    cols - number of cols in the tag mat
    CANONICAL_TAG - a tag from detections
    
    Precondition:
    rows, cols are integers > 0
    """
    expected = []
    X, Y = 0, 1
    tag = detections[CANONICAL_TAG]
    w_c = abs(tag.corners[0][X] - tag.corners[1][X]) * TAG_WIDTH / TAG_SIZE
    h_c = abs(tag.corners[1][Y] - tag.corners[2][Y]) * TAG_HEIGHT / TAG_SIZE

    print("Canonical tag spacing | x: {} y: {}".format(w_c, h_c))
    x_c = CANONICAL_TAG % cols
    y_c = CANONICAL_TAG // cols
    left_x = tag.center[X] - (w_c * x_c)
    row = [(left_x + (x * w_c), tag.center[Y]) for x in range(cols)]
    expected.append(row)
    if y_c == 0:
        new_row = row.copy()
        new_row = [(x, y + h_c) for (x, y) in new_row]
        expected.append(new_row)
        expected.append([(x, y + h_c) for (x, y) in new_row])
    elif y_c == 1:
        before_row = row.copy()
        after_row = row.copy()
        before_row = [(x, y - h_c) for (x, y) in before_row]
        after_row = [(x, y + h_c) for (x, y) in after_row]
        expected.insert(0, before_row)
        expected.append(after_row)

    expected = np.asfarray(expected)
    expected = expected.reshape((rows * cols, 2))
    
    draw_expected_grid(img, expected, tag, X, Y)

    actual = np.asfarray(points)
    result = expected - actual
    result.flatten()
    result = result.tolist()
    return [d[0] for d in result], [d[1] for d in result]


def draw_expected_grid(img, expected, tag, X = 0, Y = 1):
    """
    Draw grid for expected tag locations.

    Parameters:
    expected - list of tags' expected centers
    tag - detection for the canonical tag
    X - index for x coordinate in corners (default to 0)
    Y - index for y coordinate in corners (default to 1)
    """
    tag_width = abs(tag.corners[0][X] - tag.corners[1][X])
    tag_height = abs(tag.corners[1][Y] - tag.corners[2][Y])
    color = YELLOW
    for point in expected:
        x, y = point
        top_left = (int(x - tag_width // 2), int(y + tag_height // 2))
        bottom_right = (int(x + tag_width // 2), int(y - tag_height // 2))
        img = cv2.rectangle(img, top_left, bottom_right, color, 2)
        color = BLUE if color == YELLOW else YELLOW
    cv2.imshow("frame", img)


def get_point(corner):
    """
    Unwrap a point into an integer tuple point.

    Returns:
    x, y with x as the first element in corner and y as the second element 
    in corner.

    Parameter:
    corner - tuple representing corner of the tag
    """
    x, y = corner
    return int(x), int(y)


def undistort_image(frame, filename):
    """
    Apply checkerboard calibration data to undistort lens images.
    
    Returns:
    The undistorted image

    Parameters:
    frame - image to be undistorted
    filename - name of the calibration data file
    """
    calib_file, calib_data = util.read_json(filename)
    mat = util.get_numpy_matrix(calib_data, "camera_matrix")
    dist = util.get_numpy_matrix(calib_data, "dist_coeffs")
    new_mtx = util.get_numpy_matrix(calib_data, "new_camera_matrix")
    x = calib_data["roi"]["x"]
    y = calib_data["roi"]["y"]

    calib_file.close()

    # Undistort
    dst = cv2.undistort(frame, mat, dist, None, new_mtx)

    # Crop
    height, width = frame.shape[:2]
    dst = dst[y : y + height, x : x + width]
    return dst


def apply_transform(detections, filename):
    """
    Apply matrix transformation from calibration file data to detection points.

    Returns:
    Transformed detections

    Parameters:
    detections - list of detections of the tags
    filename - name of the calibration data file
    """
    # TODO apply the transform from calibration to the frame
    calib_file, calib_data = util.read_json(filename)
    transform_matrix = util.get_numpy_matrix(calib_data, "transform_matrix")
    camera_matrix = util.get_numpy_matrix(calib_data, "camera_matrix")
    dist_coeffs = util.get_numpy_matrix(calib_data, "dist_coeffs")
    x_offset = calib_data["offsets"]["x"]
    y_offset = calib_data["offsets"]["y"]
    detections = [{"center": d.center, "corners": d.corners.copy()} for d in detections]
    # TODO fix detections list type
    for i in range(len(detections)):
        x, y, z, theta = util.compute_tag_undistorted_pose(
            camera_matrix, dist_coeffs, transform_matrix, detections[i], TAG_SIZE
        )
        x = MULT_FACTOR * (x + x_offset)
        y = MULT_FACTOR * (y + y_offset)
        detections[i].center = (x, y, z, theta)

    calib_file.close()
    return types.SimpleNamespace(**detections)


def dist(p1, p2):
    """
    Get the euclidian distance between two points.

    Returns:
    Euclidian distance between p1 and p2

    Parameters:
    p1 - point 1 (x1, y1)
    p2 - point 2 (x2, y2)
    """
    X = 0
    Y = 1
    return np.sqrt((p2[X] - p1[X]) ** 2 + (p2[Y] - p1[Y]) ** 2)


def get_args():
    """
    Parse arguments from the command

    Returns:
    The arguments
    """
    parser = argparse.ArgumentParser(
        description="get accuracy of tag detection system"
    )
    
    parser.add_argument(
        "-r",
        "--rows",
        metavar="<rows>",
        type=int,
        default=3,
        help="Number of rows of tags in tag mat"
    )

    parser.add_argument(
        "-c",
        "--cols",
        metavar="<cols>",
        type=int,
        default=8,
        help="Number of columns of tags in tag mat"
    )

    parser.add_argument(
        "-i",
        "--index",
        metavar="<camera id>",
        type=int,
        default=0,
        help="ID of the camera to use"
    )

    parser.add_argument(
        "-f",
        "--file",
        metavar="<calib file name>",
        type=str,
        required=False,
        help="calibration file name"
    )
    
    options = parser.parse_args()
    args = vars(options)
    return args


if __name__ == "__main__":
    main()
