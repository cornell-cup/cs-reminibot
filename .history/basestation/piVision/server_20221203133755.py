# USAGE
# python3 server.py --prototxt MobileNetSSD_deploy.prototxt --model MobileNetSSD_deploy.caffemodel --montageW 2 --montageH 2

import argparse
# import the necessary packages
import math
import time
from datetime import datetime
from queue import Queue

import cv2
import imutils
import numpy as np
from imagezmq import imagezmq

# flag for debugging: version 0 = raw camera stream
# version 1 = object detection
# version 2 = messing around with color
# construct the argument parser and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-p", "--prototxt", default='piVision/MobileNetSSD_deploy.prototxt',
                help="path to Caffe 'deploy' prototxt file")
ap.add_argument("-m", "--model", default='piVision/MobileNetSSD_deploy.caffemodel',
                help="path to Caffe pre-trained model")
ap.add_argument("-c", "--confidence", type=float, default=0.2,
                help="minimum probability to filter weak detections")
ap.add_argument("-mW", "--montageW", type=int, default=2,
                help="montage frame width")
ap.add_argument("-mH", "--montageH", type=int, default=2,
                help="montage frame height")
ap.add_argument("-v", "--version", type=int, default=1,
                help="kind of detection running")
args = vars(ap.parse_args())
v = args["version"]

if v == 1:
  # initialize the ImageHub object
    imageHub = imagezmq.ImageHub()

    # initialize the list of class labels MobileNet SSD was trained to
    # detect, then generate a set of bounding box colors for each class
    CLASSES = ["background", "aeroplane", "bicycle", "bird", "boat",
               "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
               "dog", "horse", "motorbike", "person", "pottedplant", "sheep",
               "sofa", "train", "tvmonitor"]

    # load our serialized model from disk
    print("[INFO] loading model...")
    net = cv2.dnn.readNetFromCaffe(
        "./basestation/piVision/MobileNetSSD_deploy.prototxt", "./basestation/piVision/MobileNetSSD_deploy.caffemodel")

    # initialize the consider set (class labels we care about and want
    # to count), the object count dictionary, and the frame  dictionary
    CONSIDER = set(["dog", "person", "car"])
    objCount = {obj: 0 for obj in CONSIDER}
    frameDict = {}

    # initialize the dictionary which will contain  information regarding
    # when a device was last active, then store the last time the check
    # was made was now
    lastActive = {}
    lastActiveCheck = datetime.now()

    # stores the estimated number of Pis, active checking period, and
    # calculates the duration seconds to wait before making a check to
    # see if a device was active
    ESTIMATED_NUM_PIS = 4
    ACTIVE_CHECK_PERIOD = 10
    ACTIVE_CHECK_SECONDS = ESTIMATED_NUM_PIS * ACTIVE_CHECK_PERIOD

    # assign montage width and height so we can view all incoming frames
    # in a single "dashboard"
    mW = args["montageW"]
    mH = args["montageH"]
    print("[INFO] detecting: {}...".format(", ".join(obj for obj in
                                                     CONSIDER)))

    # used to record the time when we processed last frame
    prev_frame_time = 0

    # used to record the time at which we processed current frame
    new_frame_time = 0

    frame_count = 0

    fps = 0

    frame_time_queue = Queue(maxsize=5)

    # start looping over all the frames
    while True:

        # receive RPi name and frame from the RPi and acknowledge
        # the receipt
        (rpiName, frame) = imageHub.recv_image()
        imageHub.send_reply(b'OK')

        # if a device is not in the last active dictionary then it means
        # that its a newly connected device
        if rpiName not in lastActive.keys():
            print("[INFO] receiving data from {}...".format(rpiName))

            # record the last active time for the device from which we just
            # received a frame
        lastActive[rpiName] = datetime.now()

        frame_count += 1

        # calculate the frame rate as the average of the last 5 frames
        if (frame_count <= 4):
            prev_frame_time = new_frame_time
            new_frame_time = time.time()
            fps = frame_count/new_frame_time
            frame_time_queue.put(new_frame_time)
        else:
            prev_frame_time = new_frame_time
            new_frame_time = time.time()
            last_frame_time = frame_time_queue.get()
            fps = 5/(new_frame_time - last_frame_time)
            frame_time_queue.put(new_frame_time)

        # converting the fps into integer
        fps = int(fps)

        # converting the fps to string so that we can display it on frame
        # by using putText function
        fps = str(fps)

        # resize the frame to have a maximum width of 400 pixels, then
        # grab the frame dimensions and construct a blob
        frame = imutils.resize(frame, width=700, inter=cv2.INTER_NEAREST)
        (h, w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(cv2.resize(frame, (300, 300)),
                                     0.007843, (300, 300), 127.5)

        # pass the blob through the network and obtain the detections and
        # predictions
        net.setInput(blob)
        detections = net.forward()

        # reset the object count for each object in the CONSIDER set
        objCount = {obj: 0 for obj in CONSIDER}

        # loop over the detections
        for i in np.arange(0, detections.shape[2]):
            # extract the confidence (i.e., probability) associated with
            # the prediction
            confidence = detections[0, 0, i, 2]

            # filter out weak detections by ensuring the confidence is
            # greater than the minimum confidence
            if confidence > args["confidence"]:
                # extract the index of the class label from the
                # detections
                idx = int(detections[0, 0, i, 1])

                # check to see if the predicted class is in the set of
                # classes that need to be considered
                if CLASSES[idx] in CONSIDER:
                    # increment the count of the particular object
                    # detected in the frame
                    objCount[CLASSES[idx]] += 1

                    # compute the (x, y)-coordinates of the bounding box
                    # for the object
                    box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                    (startX, startY, endX, endY) = box.astype("int")

                    # draw the bounding box around the detected object on
                    # the frame
                    cv2.rectangle(frame, (startX, startY),
                                  (endX, endY), (255, 0, 0), 2)

        # draw the sending device name on the frame
        cv2.putText(frame, rpiName, (10, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # puting the FPS count on the frame
        cv2.putText(frame, fps, (650, 30), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (100, 255, 0), 3, cv2.LINE_AA)

        # draw the object count on the frame
        label = ", ".join("{}: {}".format(obj, count)
                          for (obj, count) in objCount.items())
        cv2.putText(frame, label, (10, h - 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # update the new frame in the frame dictionary
        frameDict[rpiName] = frame

        # build a montage using images in the frame dictionary
        # montages = build_montages(frameDict.values(), (w, h), (mW, mH))

        # display the montage(s) on the screen
        # for (i, montage) in enumerate(montages):
        #     cv2.imshow("On-Bot Video Stream ({})".format(i),
        #                montage)
        # print(i, datetime.now())

        cv2.imshow("On-Bot Video Stream", frame)

        # detect any kepresses
        key = cv2.waitKey(1) & 0xFF

        # if current time *minus* last time when the active device check
        # was made is greater than the threshold set then do a check
        if (datetime.now() - lastActiveCheck).seconds > ACTIVE_CHECK_SECONDS:
            # loop over all previously active devices
            for (rpiName, ts) in list(lastActive.items()):
                # remove the RPi from the last active and frame
                # dictionaries if the device hasn't been active recently
                if (datetime.now() - ts).seconds > ACTIVE_CHECK_SECONDS:
                    print("[INFO] lost connection to {}".format(rpiName))
                    lastActive.pop(rpiName)
                    frameDict.pop(rpiName)

                    # set the last active check time as current time
                lastActiveCheck = datetime.now()

            # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            break

    # do a bit of cleanup
    cv2.destroyAllWindows()

if v == 2:
    # initialize the ImageHub object
    imageHub = imagezmq.ImageHub()

    # used to record the time when we processed last frame
    prev_frame_time = 0

    # used to record the time at which we processed current frame
    new_frame_time = 0

    frame_count = 0

    fps = 0
    leftRight = 0
    iteration = 0

    frame_time_queue = Queue(maxsize=5)

    # start looping over all the frames
    while True:
        Kernal = np.ones((3, 3), np.uint8)

        # receive RPi name and frame from the RPi and acknowledge
        # the receipt
        (rpiName, frame) = imageHub.recv_image()

        imageHub.send_reply(b'OK')

        frame_count += 1

        # calculate the frame rate as the average of the last 5 frames
        if (frame_count <= 4):
            prev_frame_time = new_frame_time
            new_frame_time = time.time()
            fps = frame_count/new_frame_time
            frame_time_queue.put(new_frame_time)
        else:
            prev_frame_time = new_frame_time
            new_frame_time = time.time()
            last_frame_time = frame_time_queue.get()
            fps = 5/(new_frame_time - last_frame_time)
            frame_time_queue.put(new_frame_time)

        # converting the fps into integer
        fps = int(fps)

        # converting the fps to string so that we can display it on frame
        # by using putText function
        fps = str(fps)

        iteration += 1
        if iteration > 10:
            iteration = 0
            leftRight = 0

        # resize the frame to have a maximum width of 400 pixels, then
        # grab the frame dimensions and construct a blob
        frame = imutils.resize(frame, width=700, inter=cv2.INTER_NEAREST)

        # Convert BGR to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # define blue color range
        light_blue = np.array([50, 50, 50])
        dark_blue = np.array([150, 255, 255])

        #light_blue = np.array([50,50,50])
        #dark_blue = np.array([150,255,255])

        # Threshold the HSV image to get only blue colors
        mask = cv2.inRange(hsv, light_blue, dark_blue)

        opening = cv2.morphologyEx(mask, cv2.MORPH_OPEN, Kernal)  # Morphology

        # Bitwise-AND mask and original image
        res = cv2.bitwise_and(frame, frame, mask=opening)

        contours, hierarchy = cv2.findContours(opening, cv2.RETR_TREE,
                                               cv2.CHAIN_APPROX_NONE)

        for c in contours:
            area = cv2.contourArea(c)

            if area < 20:
                cv2.fillPoly(binary, pts=[c], color=0)

        output = cv2.bitwise_and(frame, frame, mask=mask)
        gray = cv2.cvtColor(output, cv2.COLOR_BGR2GRAY)
        ret, binary = cv2.threshold(gray, 100, 255, cv2.THRESH_OTSU)

        binary = cv2.morphologyEx(
            binary, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (51, 51)))
        contours, hierarchy = cv2.findContours(
            binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)

        rows = len(binary)
        cols = len(binary[0])
        middle = cols/2
        diff = rows * cols
        if (len(contours) == 0):
            continue

        con = contours[0]
        cen = 0

        for c in contours:
            center, radius = cv2.minEnclosingCircle(c)
            cen = center[0]
            area = cv2.contourArea(c)
            circle = math.pi * radius * radius
            if (abs(circle-area)/((area + circle)/2) < diff):
                diff = circle - area
                con = c

        with_Circularcontours = cv2.drawContours(
            frame, [con], 0, (0, 255, 0), 3)

        if (cen > middle):
            leftRight += 1
        else:
            leftRight -= 1

        if len(contours) != 0:
            cnt = contours[0]
            area = cv2.contourArea(cnt)
            distance = 966.09*area**(-0.457)
            #M = cv2.moments(con)
            #Cx = int(M['m10']/M['m00'])
            #Cy = int(M['m01'] / M['m00'])
            # S = 'Location of object:' + '(' + str(Cx) + ',' + str(Cy) + ')'
            # cv2.putText(frame, S, (5, 50), font, 2, (0, 0, 255), 2, cv2.LINE_AA)
            ##S = 'Area of contour: ' + str(area)
            ##cv2.putText(frame, S, (5, 50), font, 2, (0, 0, 255), 2, cv2.LINE_AA)
            S = 'Distance Of Object: ' + str(distance)
            cv2.putText(frame, S, (5, 50), cv2.FONT_HERSHEY_SIMPLEX,
                        .5, (0, 0, 255), 2, cv2.LINE_AA)

        # This print statement isn't displaying anywhere
        if (iteration == 10):
            print("left" if leftRight < 0 else "right")

        cv2.putText(frame, rpiName, (10, 25),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # puting the FPS count on the frame
        cv2.putText(frame, fps, (650, 30), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (100, 255, 0), 3, cv2.LINE_AA)

        cv2.imshow("On-Bot Video Stream", frame)

        # detect any kepresses
        key = cv2.waitKey(1) & 0xFF

        # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            break

    # do a bit of cleanup
    cv2.destroyAllWindows()
