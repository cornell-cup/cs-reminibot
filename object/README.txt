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


POTENTIAL ERRORS:

ERROR:
[libprotobuf ERROR google/protobuf/descriptor_database.cc:394] Invalid file descriptor data passed to EncodedDescriptorDatabase::Add().
[libprotobuf FATAL google/protobuf/descriptor.cc:1356] CHECK failed: GeneratedDatabase()->Add(encoded_file_descriptor, size):
libc++abi.dylib: terminating with uncaught exception of type google::protobuf::FatalException: CHECK failed: GeneratedDatabase()->Add(encoded_file_descriptor, size):
Abort trap: 6

SOLUTION:
pip3 uninstall protobuf
pip3 install protobuf
