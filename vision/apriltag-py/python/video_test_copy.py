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
    camera = setup_camera()

    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    start = time.time()
    frame_num = 0
    while True:
        frame_num += 1
        ret, frame = camera.read()
        if not DETECT_TAGS:
            if SHOW_IMAGE:
                cv2.imshow("frame", frame)
        fps = frame_num / (time.time() - start)
        # print("Showing frame {}".format(frame_num))
        # print("Current speed: {} fps".format(fps))
        if DETECT_TAGS:
            horizontal_dist = []
            vertical_dist = []
            row = -1
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            detections, det_image = detector.detect(gray, return_image=True)
            print(len(detections))
            points = []
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
                
            dx, dy = [], []
            for col in range(8-1):
                for row in range(3):
                    dx.append(x_pts[8*row + col + 1] - x_pts[8*row + col])
            
            y_chunks = [y_pts[(8*c):(8*(c+1))] for c in range(3)]
            for c in range(3-1):
                dy.extend([p[1]-p[0] for p in zip(y_chunks[c],y_chunks[c+1])])
            
            print("dx: {}\ndy: {}\nx_m: {} y_m: {}".format(
                dx,
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    camera.release()
    cv2.destroyAllWindows()
    pass


def get_point(corner):
    x, y = corner
    return int(x), int(y)


def setup_camera():
    camera = cv2.VideoCapture(0)
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 60)
    return camera


if __name__ == "__main__":
    main()
