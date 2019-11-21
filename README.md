Not all heroes wear capes.

Pray for us.

# MiniBot Platform

This repo is a test python implementation of MiniBot. Original repo can be found
[here](http://github.com/cornell-cup/cs-minibot). This is a refactored
version.

Minibot is a modular robotics kit meant for children and students from age 6 - 18,
developed in partnership with DaVinci Robotics. This repository contains sample
scripts that allow users to run simple algorithms on their minibot, as well as
a simple web app that is a simple interface from which users can control the
minibot and send custom scripts.

This repository is currently in development.

Software resources:
 - Tornado
 - Adafruit RPi libraries (TCS34725)
 
## Installing Dependencies 
Navigate to the gui directory in static/gui and basestation/gui and run 
```
npm install
```

If npm does not exist, install it with pip or other package downloader. In the future, this process will be incorporated into a bash file. 

## Run the BaseStation

After all dependencies are successfully installed, you can run the BaseStation on your
computer and start working with the minibot.

The BaseStation is the intermediary that manages information flow between the minibot and
hardware to the software and GUI. BaseStation runs on `cs-reminibot/basestation/base_station_interface.py` and is a
simple web application that runs on HTTP.

To run the BaseStation, run the following line in your terminal from the root directory
of this repo.

```
./run_BS.sh
```

Go to any browser on your computer and go to `localhost:8080` to see the GUI in action.
If you are having trouble running the previous line, make sure that python3 is installed.
You can check this by typing `python3` in your terminal.
