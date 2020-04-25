import cv2
import sys
import os
import argparse
from random import random

def take_pictures(args):
    image_counter = 0

    # Opens the camera
    cv2.namedWindow("Capture")
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        cap = cv2.VideoCapture(-1)

    if not cap.isOpened():
        print("Not opening")
        exit(0)

    while cap.isOpened():

        # Gets webcam feed
        ret, frame = cap.read()
        key = cv2.waitKey(1)

        # Formats output video feed
        if not args.color:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        frame = cv2.resize(frame, args.image_dim)
        frame = cv2.flip(frame, 1)
        shown_frame = cv2.resize(frame, args.window_dim)

        cv2.imshow('Capture', shown_frame)

        #Takes a picture on space
        if key & 0xFF == ord(' '):
            # Determines whether image is for training or validation
            rand = random()
            if rand < args.ratio:
                type = "training"
            else:
                type = "validation"
            path = os.getcwd() + '/' + args.folder + '/' + type + '/' + args.category + '/'
            # Makes directorties for given path
            if not os.path.isdir(path):
                os.makedirs(path)
            # Writes the capture to file
            cv2.imwrite(path + '/' + args.image_name + '_' + str(image_counter) + '.jpg', frame)
            image_counter += 1
        # Quits on escape or 'q'
        if key & 0xFF in [27, 1048603, ord('q')]:
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__=="__main__":
    # Defines arguments for parser
    parser = argparse.ArgumentParser(description='Take in arguments for taking pictures')
    parser.add_argument("-color", "-col", action="store",type=bool,dest="color", default="True",
        help="Specifies whether the pictures taken should be in color")
    parser.add_argument("-name", "-n", action="store", dest="image_name", default="img",
        help="Specifies the names of the images to generate")
    parser.add_argument("-dim", "-d", nargs='*', action="store", dest="image_dim", type=int, default=[600,600],
        help="Specifies the dimensions of the output images in px (accepts exactly two args)")
    parser.add_argument("-window", "-w", nargs='*', action="store", dest="window_dim", type=int, default=[600,600],
        help="Specifies the dimensions of the webcame feed window in px (accepts exactly two args)")
    parser.add_argument("-folder", "-f", action="store", dest="folder", default="images",
        help="Specifies the folder that the images should be stored in")
    parser.add_argument("-category", "-c", action="store", dest="category", default="True",
        help="Specifies the category of the images")
    parser.add_argument("-ratio", "-r", action="store", dest="ratio", default=.2, type=float,
        help="Specifies the ratio of images to be store as training images to all taken (0 < ratio < 1)")
    args = parser.parse_args()

    # Additional constrainst on arguments
    if args.image_dim is not None and len(args.image_dim) != 2:
        parser.error('-dim expected two values')
    if args.window_dim is not None and len(args.window_dim) != 2:
        parser.error('-window expected two values')
    if args.ratio < 0 or args.ratio > 1:
        parser.error('x must be in [0,1] in \'-ratio x\'')

    # Converts image_dim and window_dim from array to tuple
    args.image_dim = (args.image_dim[0],args.image_dim[1])
    args.window_dim = (args.window_dim[0],args.window_dim[1])

    take_pictures(args)
