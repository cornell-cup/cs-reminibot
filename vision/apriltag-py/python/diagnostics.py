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
                
                # 2D array to keep track of horizontal distance of current tag
                # and the one next to it
                if detections[d].center[0] < detections[d - 1].center[0]:
                    print("adding new array")
                    horizontal_dist.append([])
                    row += 1
                else:
                    print("current_row")
                    print(row)
                    horizontal_dist[row].append(
                        detections[d].center[0] - detections[d-1].center[0])

                cv2.circle(frame, (int(tag_x), int(tag_y)), 5, (0, 0, 255))
                cv2.line(frame, cp, x_axis, (0, 0, 255), 5)
                cv2.line(frame, cp, y_axis, (0, 255, 0), 5)

            if SHOW_IMAGE:
                cv2.imshow("frame", frame)

            # Analyze points for error based on position
            print("Points: {}".format(points))
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
            
            print("dx: {}\ndy: {}\nx_m: {} y_m: {}".format(
                dx,
                dy,
                statistics.median(dx),
                statistics.median(dy)
            ))
            print(max(dx))
            print("xvar: {} yvar: {}".format(
                max(dx)-min(dx), 
                max(dy)-min(dy)
            ))
            quit()

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
