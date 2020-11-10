"""
Script to take pictures of the object shown by the user. It currently
requires the user to constantly press the space bar to take images once the script is
running. When space is pressed while the webcam feed is shown, the captured image
is augmented a certain amount of times, and the resulting images are saved in the
appropriate folder. There will be the following file structure.

object
├── images
    └── category1
    └── category2
    └── ...
"""

#packages
import cv2
import sys
import os
import argparse
import numpy as np
from keras_preprocessing.image import ImageDataGenerator
from random import random
#modules
import augment

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

    # Instantiates image augmenter according to parameters
    datagen = ImageDataGenerator(
        rescale = 1./255, fill_mode='nearest',
        rotation_range=args.rotation_range,
        width_shift_range = args.width_shift_range,
        height_shift_range = args.height_shift_range,
        shear_range = args.shear_range,
        zoom_range = args.zoom_range,
        horizontal_flip = args.horizontal_flip,
        vertical_flip = args.vertical_flip
        )

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

        cv2.imshow('Capture', frame)

        # Quits on escape or 'q'
        if key & 0xFF in [27, 1048603, ord('q')]:
            exit = True
            break

        #Takes a picture on space
        if key & 0xFF == ord(' '):

            # Defins directory for resulting images, and creates it if nonexistent
            path = os.getcwd() + "/images/" + args.category + "/"
            if not os.path.isdir(path):
                os.makedirs(path)

            # Augments capture frame, and saves all resulting images to appropriate directory
            frame = np.expand_dims(frame, 0)
            datagen.fit(frame)
            for x, val in zip(datagen.flow(frame,
                save_to_dir=path,
                 save_prefix='img',
                save_format='png'),range(args.amount - 1)):
                pass

    cap.release()
    cv2.destroyAllWindows()

if __name__=="__main__":
    # Defines arguments for parser
    parser = argparse.ArgumentParser(description='Take in arguments for taking pictures')
    parser.add_argument("-color", "-col", action="store",type=bool,dest="color", default="True",
        help="Specifies whether the pictures taken should be in color")
    parser.add_argument("-name", "-n", action="store", dest="image_name", default="img",
        help="Specifies the names of the images to generate")
    parser.add_argument("-dim", "-d", nargs='*', action="store", dest="image_dim", type=int, default=[300,300],
        help="Specifies the dimensions of the output images in px (accepts exactly two args)")
    parser.add_argument("-window", "-w", nargs='*', action="store", dest="window_dim", type=int, default=[300,300],
        help="Specifies the dimensions of the webcame feed window in px (accepts exactly two args)")

    # Defines category of images for this current capture (either 'True' or 'False' for binary classification)
    parser.add_argument("-category", "-c", action="store", dest="category", default="True",
        help="Specifies the category of the images")

    #Image augmentation
    parser.add_argument('-amount', action="store", type=int, dest="amount", default=10,
        help="Amount of augmented images to create from single capture")
    parser.add_argument('-rot', action="store", type=float, dest="rotation_range", default=40, help='Degree range for random rotations of the image')
    parser.add_argument('-width', action="store", type=float, dest="width_shift_range", default=0.2, help='Width shift range')
    parser.add_argument('-height', action="store", type=float, dest="height_shift_range", default=0.2, help='Height shift range')
    parser.add_argument('-shear', action="store", type=float, dest="shear_range", default=0.2, help='Shear range')
    parser.add_argument('-zoom', action="store", type=float, dest="zoom_range", default=0.2, help='Zoom range')
    parser.add_argument('-hflip', action="store", type=bool, dest="horizontal_flip", default=True, help='Horizontal flip')
    parser.add_argument('-vflip', action="store", type=bool, dest="vertical_flip", default=True, help='Vertical flip')

    #Puts images in 'test' if specified
    parser.add_argument("-test","-t",dest="test", action="store_true")

    args = parser.parse_args()

    # Additional constrainst on arguments
    if args.image_dim is not None and len(args.image_dim) != 2:
        parser.error('-dim expected two values')
    if args.window_dim is not None and len(args.window_dim) != 2:
        parser.error('-window expected two values')
    # if args.ratio < 0 or args.ratio > 1:
    #     parser.error('x must be in [0,1] in \'-ratio x\'')

    # Converts image_dim and window_dim from array to tuple
    args.image_dim = (args.image_dim[0],args.image_dim[1])
    args.window_dim = (args.window_dim[0],args.window_dim[1])

    take_pictures(args)
