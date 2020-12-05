from os import write
from PIL import Image
import numpy as np

IMAGE_WIDTH = 300
IMAGE_HEIGHT = 300
TRUE_IMAGE = 100
FALSE_IMAGE = 100

SPRITE_WIDTH = 100 * 100
SPRITE_UNIT = (IMAGE_WIDTH * IMAGE_HEIGHT * 3) // SPRITE_WIDTH 


def write_sprite():
    # Result in a 5400 * 100000 sprite image of the 200 300 * 300 training images (100 true, 100 false)
    sprite_array = np.zeros(((TRUE_IMAGE + FALSE_IMAGE) * SPRITE_UNIT, SPRITE_WIDTH))

    prefix = './images/training/'

    sum = 0
    i = 0
    while sum < TRUE_IMAGE:
        print(sum)
        try:
            image = Image.open(prefix + 'TRUE/img_' + str(i) + '.jpg')
            image_array = np.array(image)
            image_array = np.reshape(image_array, (SPRITE_UNIT, SPRITE_WIDTH))
            for j in range(SPRITE_UNIT):
                sprite_array[sum * SPRITE_UNIT + j] = image_array[j]
            sum += 1
            i += 1
        except:
            i += 1

    sum = 0
    i = 0
    while sum < FALSE_IMAGE:
        print(sum)
        try:
            image = Image.open(prefix + 'FALSE/img_' + str(i) + '.jpg')
            image_array = np.array(image)
            image_array = np.reshape(image_array, (SPRITE_UNIT, SPRITE_WIDTH))
            for j in range(SPRITE_UNIT):
                sprite_array[TRUE_IMAGE * SPRITE_UNIT + sum * SPRITE_UNIT + j] = image_array[j]
            sum += 1
            i += 1
        except:
            i += 1

    print(sprite_array)

    sprite_image = Image.fromarray(sprite_array)
    sprite_image = sprite_image.convert('RGB')
    sprite_image.save('data/sprite.png')


def write_labels():
    label_array = np.zeros(TRUE_IMAGE + FALSE_IMAGE)
    for i in range(TRUE_IMAGE):
        label_array[i] = 1
    print(label_array)
    label_array.tofile('labels')

write_labels()
label_array = np.fromfile('labels')
print(label_array[:150])