import tensorflow as tf
import keras_preprocessing
from keras_preprocessing import image
from keras_preprocessing.image import ImageDataGenerator
import sys

def augment(arguments):
    """
    Class ImageDataGenerator:

    Fixed parameters:
    - rescale
    - fill_mode

    User-given parameter: (Not complete)
    - rotation_range
    - width_shift_range
    - height_shift_range
    - shear_range
    - zoom_range
    - horizontal_flip
    - vertical_flip

    Working on providing user information about these parameters.
    """
    #for training data
    training_datagen = ImageDataGenerator(rescale = 1./255, fill_mode='nearest',
                                          rotation_range=arguments["rotation_range"],
                                          width_shift_range = arguments["width_shift_range"],
                                          height_shift_range = arguments["height_shift_range"],
                                          shear_range = arguments["shear_range"],
                                          zoom_range = arguments["zoom_range"],
                                          horizontal_flip = arguments["horizontal_flip"],
                                          vertical_flip = arguments["vertical_flip"]
                                          )

    #for validation data
    validation_datagen = ImageDataGenerator(rescale = 1./255)

    print("works")



if __name__=="__main__":
    print("Please enter the parameter values when prompted: ")

    arguments = {}
    params=["rotation_range", "width_shift_range", "height_shift_range",
            "shear_range", "zoom_range", "horizontal_flip", "vertical_flip"]

    for x in params:
        if x in ["horizontal_flip", "vertical_flip"]:
            arguments[x] = bool(input(x+": "))
        else:
            arguments[x] = float(input(x+": "))

    augment(arguments)
