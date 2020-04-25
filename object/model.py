#packages
import tensorflow as tf
import os

#modules
import augment

def readDirectories(train_directory, validation_directory):
    """
    Inputs:
    train_directories (list of length 2)
    validation_directories (list of length 2)

    Reads and stores directory paths for training and validation images of both
    classes (binary classification).
    """
    # Training data directory with True pictures of the object
    trainDirectory_true = os.path.join(train_directories[0])

    # Training data directory with False pictures of the object
    trainDirectory_false = os.path.join(train_directories[1])

    # Validation data directory with True pictures of object
    valDirectory_true = os.path.join(validation_directories[0])

    # Validation data directory with training human pictures
    valDirectory_false = os.path.join(validation_directories[1])





def model(arguments):
    #Define model here
