#packages
import tensorflow as tf
import keras_preprocessing
from keras_preprocessing import image
from keras_preprocessing.image import ImageDataGenerator
import sys
import os
import argparse

import warnings
warnings.filterwarnings("ignore")

def augmentation(args):
    """
    Class ImageDataGenerator:

    Fixed parameters:
    - rescale
    - fill_mode

    User-given parameter: (Not complete)

    For ImageDataGenerator:
    - rotation_range
    - width_shift_range
    - height_shift_range
    - shear_range
    - zoom_range
    - horizontal_flip
    - vertical_flip

    For flow_from_directory: (need to implement this) *** NOT INCLUDING THESE RIGHT NOW ***
    - batch_size
    - target_size (can be user given but will impact the model so may wanna rethink this)


    Working on providing user information about these parameters.
    """
    #for training data
    training_datagen = ImageDataGenerator(rescale = 1./255, fill_mode='nearest',
                                          rotation_range=args["rotation_range"],
                                          width_shift_range = args["width_shift_range"],
                                          height_shift_range = args["height_shift_range"],
                                          shear_range = args["shear_range"],
                                          zoom_range = args["zoom_range"],
                                          horizontal_flip = args["horizontal_flip"],
                                          vertical_flip = args["vertical_flip"]
                                          )

    #for validation data
    validation_datagen = ImageDataGenerator(rescale = 1./255)

    #flowing in data from the respective directories using the instances created above
    train_generator = training_datagen.flow_from_directory(
            './images/training',  # training directory inside images
            target_size=(300, 300),  # Resize images to 300 x 300
            batch_size=32,   #batch size
            class_mode='binary') # class_mode is the type of classification


    validation_generator = validation_datagen.flow_from_directory(
            './images/validation',  # validation directory inside images
            target_size=(300, 300),  # Resize images to 300 x 300
            batch_size=16, #batch size - tend to keep smaller than the train_generator batch size
            class_mode='binary') # class_mode is the type of classification

    return train_generator, validation_generator


if __name__=="__main__":
    parser = argparse.ArgumentParser(description='Augmentation parameters')
    parser.add_argument('-rot', action="store", type=float, dest="rotation_range",
                        default=40, help='Degree range for random rotations of the image')
    parser.add_argument('-width', action="store", type=float, dest="width_shift_range",
                        default=0.2, help='Width shift range')
    parser.add_argument('-height', action="store", type=float, dest="height_shift_range",
                        default=0.2, help='Height shift range')
    parser.add_argument('-shear', action="store", type=float, dest="shear_range",
                        default=0.2, help='Shear range')
    parser.add_argument('-zoom', action="store", type=float, dest="zoom_range",
                        default=0.2, help='Zoom range')
    parser.add_argument('-hflip', action="store", type=bool, dest="horizontal_flip",
                        default=True, help='Horizontal flip')
    parser.add_argument('-vflip', action="store", type=bool, dest="vertical_flip",
                        default=True, help='Vertical flip')
    args = vars(parser.parse_args())


    augmentation(args)
