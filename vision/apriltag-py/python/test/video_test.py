import cv2
import numpy as np
import util.apriltag as apriltag
import time
import util

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
            gray = cvtColor(frame, cv2.COLOR_BGR2GRAY)
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

            # 2D array to keep track of vertical distance of current tag and the
            # one immediate below it.
            num_cols = len(horizontal_dist[0]) + 1
            for i in range(num_cols):
                vertical_dist.append([])
                for j in range(row):
                    vertical_dist[i][j] = (
                        detections[i + num_cols ].center[1]
                        - detections[i].center[1]
                    )

            horizontal_dist = np.array(horizontal_dist)
            vertical_dist = np.array(vertical_dist)
            
            horizontal_mean = np.mean(horizontal_dist)
            horizontal_median = np.median(horizontal_dist)
            horizontal_std = np.std(horizontal_dist)
            vertical_mean = np.mean(vertical_dist)
            vertical_median = np.median(vertical_dist)
            vertical_std = np.std(vertical_dist)

            x_pts, y_pts = [p[0] for p in points], [p[1] for p in points]
            dx, dy = [], []
            for col in range(8-1):
                for row in range(3):
                    dx.append(x_pts[8*row + col + 1] - x_pts[8*row + col])
                    dy.append(y_pts[8*row + col + 1] - y_pts[8*row + col])
            print("H: {}".format(dx))
            print("V: {}".format(dy))

            print("H: {}".format(horizontal_dist))
            print("H mean: {}".format(horizontal_mean))
            print("H median: {}".format(horizontal_median))
            print("H stddev: {}".format(horizontal_std))
            print("")
            print("V: {}".format(vertical_dist))
            print("V mean: {}".format(vertical_mean))
            print("V median: {}".format(vertical_median))
            print("V stddev: {}".format(vertical_std))
            print("")

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
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 60)
    return camera


if __name__ == "__main__":
    main()
