import cv2
import numpy as np
import apriltag
import time
import util
import itertools
import statistics

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
BLUE = (255, 0, 0)


def main():
    camera = setup_camera(1)

    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    _, frame = camera.read()
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    detections, _ = detector.detect(gray, return_image=True)
    print(len(detections))
    points = []
    for d in range(len(detections)):
        tag_x, tag_y = detections[d].center
        center_point = (int(tag_x), int(tag_y))
        points.append(center_point)

    if SHOW_IMAGE:
        cv2.imshow("frame", frame)

    # Analyze points for error based on position
    print(compute_stats(points))
    # points = []

    # # Do it all again, but undistort
    # calib_file, calib_data = util.read_calib_json("tester.json")
    # camera_matrix = util.get_numpy_matrix(calib_data, "camera_matrix")
    # dist_coeffs = util.get_numpy_matrix(calib_data, "dist_coeffs")
    # new_camera_matrix = util.get_numpy_matrix(calib_data, "new_camera_matrix")
    # calib_file.close()
    
    # new_image = cv2.undistort(frame, camera_matrix, dist_coeffs, None, new_camera_matrix)
    # gray = cv2.cvtColor(new_image, cv2.COLOR_BGR2GRAY)
    # detections, _ = detector.detect(gray, return_image=True)
    # print(len(detections))
    # points = []
    # for d in range(len(detections)):
    #     tag_x, tag_y = detections[d].center
    #     center_point = (int(tag_x), int(tag_y))
    #     points.append(center_point)
    
    # print(compute_stats(points))
    camera.release()
    cv2.destroyAllWindows()
    pass

def compute_stats(points):
    print("Points: {}".format(points))
    assert(len(points) == 24)
    x_pts, y_pts = [p[0] for p in points], [p[1] for p in points]
    dx, dy = [], []
    for col in range(8-1):
        for row in range(3):
            # Take differences between adjacent columns
            dx.append(x_pts[8*row + col + 1] - x_pts[8*row + col])
    # Chunk by rows
    y_chunks = [y_pts[(8*c):(8*(c+1))] for c in range(3)]
    for c in range(3-1):
        # Take differences between adjacent rows
        dy.extend([p[1]-p[0] for p in zip(y_chunks[c],y_chunks[c+1])])
    
    return {
        "dx": dx,
        "dy": dy,
        "x_median": statistics.median(dx),
        "y_median": statistics.median(dy),
        "x_var": max(dx)-min(dx),
        "y_var": max(dy)-min(dy)
    }

def get_point(corner):
    x, y = corner
    return int(x), int(y)


def setup_camera(idx):
    camera = cv2.VideoCapture(idx)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 60)
    return camera


if __name__ == "__main__":
    main()
