#packages
import tensorflow as tf
import os
import argparse
import numpy as np
import warnings
warnings.filterwarnings("ignore")
#modules
import augment


"""
very important - needed to prevent the epochs from getting cancelled.
Found github issues related to this, still figuring out...
"""
# Just disables the warning, doesn't enable AVX/FMA
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

def build_model():
    """
    Function to build the CNN architecture. Will take in parameters like these
    - type of convolution layer
    - number of filters
    - size of kernels
    - activation functions
    - input shape (important to keep standard with augmentation)
    - NUMBER OF LAYERS TO ADD (this and number of filters will need to be carefully chosen)
    - activation function for fully-connected layer at the end
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

    return model
    # print(model.summary())

def compile_model():
    """
    Compiling the model.
    Take in parameters like:
    - optimizer type
    - loss function
    - metrics to measure performance
    """
    model = build_model()
    model.compile(loss='binary_crossentropy',
                  optimizer=tf.keras.optimizers.RMSprop(lr=1e-4),
                  metrics=['accuracy'])
    return model

def train_model(args):
    """
    Steps_per_epoch and epochs are very important. They need to be chosen such
    that batch_size (for training and validation) <= epochs * steps_per_epoch.
    """
    model = compile_model()
    train_generator, validation_generator = augment.augmentation(args)
    history = model.fit(
      train_generator,
      steps_per_epoch=10,
      epochs=4,
      workers = 1,
      verbose=1,
      validation_data = validation_generator,
      validation_steps=4)



if __name__=="__main__":

    # adding argument parsing for augment here (use default values to test)
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
    train_model(args)


    """

    NOTES:

    Not user based (currently):
    - type of convolution (fixed at Conv2D)

    User defined:
    - binary or multiclass classification (impacts final activation function: sigmoid or softmax)
    - color or grayscale (number of channels in input shape: 3 or 1)



    - number of hidden layers (tricky!!!) need to work the math out here a little



    """
