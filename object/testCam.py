import cv2 as cv
import sys
import os

if __name__=='__main__':

    cap = cv.VideoCapture(0)
    if not cap.isOpened:
        print('--(!)Error opening video capture')
        exit(0)

    while True:
        ret, frame = cap.read()
        print(ret)
        exit(0)
        # if frame is None:
        #     print('--(!) No captured frame -- Break!')
        #     exit(0)
        # cv2.imshow("preview",frame)
