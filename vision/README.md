# Vision System Installation

## For Developers
If you are developing with an integrated terminal, make sure it has permission to access your camera. Issues have been reported on newer OSes running VSCode's integrated terminal due to lack of camera permissions and lack of configuration to obtain camera permissions, so it's often best to run in the shell of your choice.

## Running on Windows Subsystem for Linux (WSL)
There is no hardware support for WSL, so the camera will not work. The recommended workaround for this is to install the vision system dependencies on Windows (not WSL) and run it via command line instead of using the buttons on the GUI.

## Running on Windows
Windows may be incompatible with the Apriltag library.
