# MiniBot Platform

Minibot is a modular robotics kit meant for children and students from age 6 - 18,
developed in partnership with DaVinci Robotics. This repository contains sample
scripts that allow users to run simple algorithms on their minibot, as well as
a simple web app that is a simple interface from which users can control the
minibot and send custom scripts.

This repository is currently in development.

## Cloning the respository
To clone (download) the respository onto your local machine:
```
git clone https://github.com/cornell-cup/cs-reminibot.git
```

## Initial Requirements
Please install the following:
* Python3
* pip3 (The package manager for python3)
* Node.js (The Javascript runtime library)
* npm (The Javascript package manager) 

## Installing Python3 Dependencies
Run the following commands to navigate to the basestation directory in and install the Python3 dependencies 
```
cd cs-reminibot/basestation
pip3 install -r requirements.txt
cd ..
```

 
## Installing JavaScript Dependencies 
Run the following commands to navigate to the gui directory in static/gui and install JavaScript dependencies 
```
cd cs-reminibot/static/gui
npm install
cd ../..
```

## Run the BaseStation

After all dependencies are successfully installed, you can run the BaseStation on your
computer and start working with the minibot.

The BaseStation is the intermediary that manages information flow between the minibot and
hardware to the software and GUI. BaseStation runs on `cs-reminibot/basestation/base_station_interface.py` and is a
simple web application that runs on HTTP.

To run the BaseStation, run the following lines to navigate to the root directory
of this repo and start the BaseStation.

```
cd cs-reminibot
./run_BS.sh
```

Go to any browser on your computer and go to `localhost:8080/start` to see the GUI in action.
If you are having trouble running the previous line, make sure that python3 is installed.
You can check this by typing `python3` in your terminal.
