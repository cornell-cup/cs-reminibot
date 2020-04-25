import tensorflow as tf
import keras_preprocessing
from keras_preprocessing import image
from keras_preprocessing.image import ImageDataGenerator
import sys
import os

def augmentation(arguments):
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

    For flow_from_directory: (need to implement this)
    - batch_size
    - target_size (can be user given but will impact the model so may wanna rethink this)

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

    #flowing in data from the respective directories using the instances created above

    train_generator = training_datagen.flow_from_directory(
            './images/train',  # training directory inside images
            target_size=(300, 300),  # Resize images to 300 x 300
            batch_size=128,   #batch size
            class_mode='binary') # class_mode is the type of classification


    validation_generator = validation_datagen.flow_from_directory(
            './images/validation',  # validation directory inside images
            target_size=(300, 300),  # Resize images to 300 x 300
            batch_size=32, #batch size - tend to keep smaller than the train_generator batch size
            class_mode='binary') # class_mode is the type of classification

    print("works")


def read_images(path):
    imagepaths, labels = list(), list()
    # An ID will be affected to each sub-folders by alphabetical order
    label = 0
    # Gets full path to current directory
    c_dir = os.path.join(os.getcwd(),path)

    # Loops through the files in the current directoy
    for file in os.listdir(c_dir):
        if file.endswith('.jpg') or file.endswith('.jpg'):
            imagepaths.append(os.path.join(c_dir,file))
            labels.append(str(label))
            label += 1

    # Convert to Tensor
    imagepaths = tf.convert_to_tensor(imagepaths, dtype=tf.string)
    labels = tf.convert_to_tensor(labels, dtype=tf.string)

    # Build a TF Queue, shuffle data
    images, labels = tf.data.Dataset.from_tensor_slices([imagepaths, labels])


    # Read images from disk
    images = [tf.io.read_file(image) for image in images]
    images = [tf.image.decode_jpeg(image, channels=3) for image in images]
    images = tf.convert_to_tensor(images, dtype=tf.float32)

    # Rescale values
    images = tf.truediv(images,256.0)

    print('works')

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
