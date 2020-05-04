Steps to run:

1. python3 take_picture.py

Main flags needed:

-category (true or false)
(NOTE: will need to run script twice to take true and false pictures)

-ratio (training to validation)

Once webcam windows opens, spam the "space" button to take pictures. Recommended to take atleast a few hundred.
Ctrl+c to quit.

Should have new folder 'images' in current directory. Looks like:

object/images
├── training
    └── True
    └── False
├── validation
    └── True
    └── False

2. python3 model.py

(currently no need for flags as it takes default values for augmentation)
As of now, it is a standard CNN model. Will add user customization gradually. 
