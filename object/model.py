#packages
import tensorflow as tf
import os
import argparse
import numpy as np
import keras

import warnings
warnings.filterwarnings("ignore")


#modules
import augment

# def readDirectories(args):
#     """
#     Inputs:
#     train_directories (list of length 2)
#     validation_directories (list of length 2)
#
#     Reads and stores directory paths for training and validation images of both
#     classes (binary classification).
#     """
#     # Training data directory with True pictures of the object
#     trainDirectory_true = os.path.join(args["trainDirectory_true"])
#
#     # Training data directory with False pictures of the object
#     trainDirectory_false = os.path.join(args["trainDirectory_false"])
#
#     # Validation data directory with True pictures of object
#     valDirectory_true = os.path.join(args["valDirectory_true"])
#
#     # Validation data directory with training human pictures
#     valDirectory_false = os.path.join(args["valDirectory_false"])
#
#     print("works")


def model(arguments):




if __name__=="__main__":

    parser = argparse.ArgumentParser(description='Model parameters')

    # parser.add_argument('-trTrue', action="store", type=str, dest="trainDirectory_true",
    #                     help='Training data directory with True pictures of the object')
    # parser.add_argument('-trFalse', action="store", type=str, dest="trainDirectory_false",
    #                     help='Training data directory with False pictures of the object')
    # parser.add_argument('-valTrue', action="store", type=str, dest="valDirectory_true",
    #                     help='Validation data directory with True pictures of object')
    # parser.add_argument('-valFalse', action="store", type=str, dest="valDirectory_false",
    #                     help='Validation data directory with training human pictures')





    args = vars(parser.parse_args())

    readDirectories(args)



    """
    Not user based (currently):
    - type of convolution (fixed at Conv2D)

    User defined:
    - binary or multiclass classification (impacts final activation function: sigmoid or softmax)
    - color or grayscale (number of channels in input shape: 3 or 1)



    - number of hidden layers (tricky!!!) need to work the math out here a little



    """






model = tf.keras.models.Sequential([
    # Note the input shape is the desired size of the image 300x300 with 3 bytes color
    # This is the first convolution
    tf.keras.layers.Conv2D(16, (3,3), activation='relu', input_shape=(300, 300, 3)),
    tf.keras.layers.MaxPooling2D(2, 2),
    # The second convolution
    tf.keras.layers.Conv2D(32, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    # The third convolution
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    # The fourth convolution
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    # The fifth convolution
    tf.keras.layers.Conv2D(64, (3,3), activation='relu'),
    tf.keras.layers.MaxPooling2D(2,2),
    # Flatten the results to feed into a DNN
    tf.keras.layers.Flatten(),
    # 512 neuron hidden layer
    tf.keras.layers.Dense(512, activation='relu'),
    # Only 1 output neuron. It will contain a value from 0-1 where 0 for 1 class ('horses') and 1 for the other ('humans')
    tf.keras.layers.Dense(1, activation='sigmoid')
])
