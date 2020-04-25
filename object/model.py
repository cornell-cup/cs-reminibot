#packages
import tensorflow as tf
import os
import argparse

#modules
import augment

def readDirectories(args):
    """
    Inputs:
    train_directories (list of length 2)
    validation_directories (list of length 2)

    Reads and stores directory paths for training and validation images of both
    classes (binary classification).
    """
    # Training data directory with True pictures of the object
    trainDirectory_true = os.path.join(args["trainDirectory_true"])

    # Training data directory with False pictures of the object
    trainDirectory_false = os.path.join(args["trainDirectory_false"])

    # Validation data directory with True pictures of object
    valDirectory_true = os.path.join(args["valDirectory_true"])

    # Validation data directory with training human pictures
    valDirectory_false = os.path.join(args["valDirectory_false"])

    print("works")





def model(arguments):
    #Define model here
    pass


if __name__=="__main__":

    parser = argparse.ArgumentParser(description='Model parameters')
    parser.add_argument('trainDirectory_true', type=str, help='Training data directory with True pictures of the object')
    parser.add_argument('trainDirectory_false', type=str, help='Training data directory with False pictures of the object')
    parser.add_argument('valDirectory_true', type=str, help='Validation data directory with True pictures of object')
    parser.add_argument('valDirectory_false', type=str, help='Validation data directory with training human pictures')
    args = vars(parser.parse_args())

    readDirectories(args)
