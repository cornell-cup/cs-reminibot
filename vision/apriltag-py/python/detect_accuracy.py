import cv2
import numpy as np
import apriltag
import time
import util
import itertools
import statistics
import sys

"""
Shows a video to detect tags live.

Interesting notes:

DETECT_TAGS SHOW_IMAGE  STABLE FPS
False       False       30
False       True        4-5


This DOES NOT include any overhead that our vision
system may add.
"""

DETECT_TAGS = True
SHOW_IMAGE = True
PRINT_FPS = False
BLUE = (255, 0, 0)
APPLY_CHECKERBOARD = True
APPLY_TRANSFORM = False
CANONICAL_TAG = 1 # This tag is used as a canonical distance conversion
# Tag size is 6.25" with 8.5" expected width spacing and 11" expected height spacing
def main():
    camera = setup_camera(0)

    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    start = time.time()
    frame_num = 0
    while True:
        if PRINT_FPS:
            frame_num += 1
        ret, frame = camera.read()
        if not DETECT_TAGS:
            if SHOW_IMAGE:
                cv2.imshow("frame", frame)
        if PRINT_FPS:
            fps = frame_num / (time.time() - start)
            print("Showing frame {}".format(frame_num))
            print("Current speed: {} fps".format(fps))
        if DETECT_TAGS:
            if APPLY_CHECKERBOARD:
                frame = undistort_image(frame, sys.argv[1])
            elif APPLY_TRANSFORM:
                frame = apply_transform(frame, sys.argv[1])
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            detections, det_image = detector.detect(gray, return_image=True)
            print(len(detections))
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

            if len(detections) == 24:
                # Compute diffs in x and y for tag mat
                dx, dy = compute_diffs(points) if CANONICAL_TAG is None else compute_canonical_diffs(points, detections)
                dim_lst = np.array(dim_lst)
                # print stats
                print("dx: {}\ndy: {}\nx_m: {} y_m: {}".format(
                    None, None, max(dx)-min(dx), max(dy)-min(dy)))

                # Compute stats for dim_lst
                print("dimension (w x h): \nmax_diff_w: {} max_diff_h: {}".format(
                    max(dim_lst[:, 0])-min(dim_lst[:, 0]), max(dim_lst[:, 1])-min(dim_lst[:, 1])))
                lengths = [item for sublist in dim_lst for item in sublist]
                
                widths = [l[0] for l in dim_lst]
                heights = [h[1] for h in dim_lst]
                print("Widths: {}".format(widths))
                print("Heights: {}".format(heights))
                print("Median width: {}".format(statistics.median(widths)))
                print("Median height: {}".format(statistics.median(heights)))
                    
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    camera.release()
    cv2.destroyAllWindows()
    pass

def compute_diffs(points):
    dx, dy = [], []
    x_pts = [p[0] for p in points]
    y_pts = [p[1] for p in points]
    for col in range(8-1):
        for row in range(3):
            dx.append(x_pts[8*row + col + 1] - x_pts[8*row + col])
    y_chunks = [y_pts[(8*c):(8*(c+1))] for c in range(3)]
    for c in range(3-1):
        dy.extend([p[1]-p[0]
                    for p in zip(y_chunks[c], y_chunks[c+1])])
    return dx, dy

def compute_canonical_diffs(points, detections):
    expected = []
    X,Y = 0,1
    tag = detections[CANONICAL_TAG]
    w_c = abs(tag.corners[0][X] - tag.corners[1][X]) * 8.5 / 6.25 
    h_c = abs(tag.corners[1][Y] - tag.corners[2][Y]) * 11 / 6.25
    print("Canonical tag spacing | x: {} y: {}".format(w_c, h_c))
    x_c = CANONICAL_TAG % 8
    y_c = CANONICAL_TAG // 8
    left_x = tag.center[X] - (w_c * x_c)
    row = [(left_x + (x * w_c), tag.center[Y]) for x in range(8)]
    expected.append(row)
    if y_c == 0:
        new_row = row.copy()
        new_row = [(x, y+h_c) for (x,y) in new_row]
        expected.append(new_row)
        expected.append([(x, y+h_c) for (x,y) in new_row])
    elif y_c == 1:
        before_row = row.copy()
        after_row = row.copy()
        before_row = [(x, y-h_c) for (x,y) in before_row]
        after_row = [(x, y+h_c) for (x,y) in after_row]
        expected.insert(0, before_row)
        expected.append(after_row)

    expected = np.asfarray(expected)
    expected = expected.reshape((24,2))
    actual = np.asfarray(points)
    result = expected - actual
    result.flatten()
    result = result.tolist()
    return [d[0] for d in result], [d[1] for d in result]



def get_point(corner):
    x, y = corner
    return int(x), int(y)


def undistort_image(frame, filename):
    calib_file, calib_data = util.read_calib_json(filename)
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
    dst = dst[y:y+height, x:x+width]
    return dst


def apply_transform(frame, filename):
    # TODO apply the transform from calibration to the frame
    return frame


def setup_camera(idx):
    camera = cv2.VideoCapture(idx)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 60)
    return camera

def dist(p1, p2):
    X = 0
    Y = 1
    return np.sqrt(
        (p2[X] - p1[X])**2 + (p2[Y]-p1[Y])**2
    )


if __name__ == "__main__":
    main()
