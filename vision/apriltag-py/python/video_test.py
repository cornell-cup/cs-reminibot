from cv2 import *
import numpy as np
import apriltag
import time

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
                cv2.imshow('frame', frame)
        fps = frame_num / (time.time() - start)
        print("Showing frame {}".format(frame_num))
        print("Current speed: {} fps".format(fps))
        if DETECT_TAGS:
            gray = cvtColor(frame, cv2.COLOR_BGR2GRAY)
            detections, det_image = detector.detect(gray, return_image=True)
            for d in detections:
                tag_x, tag_y = d.center
                print("Tag {} found at ({},{})".format(d.tag_id, tag_x, tag_y))
                # cv2.circle(frame, d.center, 5, BLUE)
                cv2.circle(frame, (int(tag_x), int(tag_y)), 5, (0, 0, 255))
            if SHOW_IMAGE:
                cv2.imshow('frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    camera.release()
    cv2.destroyAllWindows()
    pass


def setup_camera():
    camera = cv2.VideoCapture(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 60)
    return camera


if __name__ == '__main__':
    main()
