# MiniBot Platform

Minibot is a modular robotics kit meant for children and students from age 6 - 18,
developed in partnership with DaVinci Robotics. This repository contains sample
scripts that allow users to run simple algorithms on their minibot, as well as
a simple web app that is a simple interface from which users can control the
minibot and send custom scripts.

This repository is currently in development.

# Initial Requirements
Please install the following:
* Git
* Python3
* pip3 (The package manager for python3)
* Node.js (The Javascript runtime library)
* npm (The Javascript package manager) 

## Ubuntu 18: Installing Initial Requirements

#### Git installation:
In a terminal run:
```
sudo apt install git
```

#### Python3 installation:
Python 3 should already be installed.  Run the following command in a terminal and you should see the python interpreter open.  
```
python3
```
Run quit() in the interpreter to exit out of it.  

#### Pip3 installation:
In a terminal run:
```
sudo apt install python3-pip
```

#### Node.js and npm installation:
In a terminal run:
```
sudo apt update
sudo apt install nodejs
sudo apt install npm
```

Upgrade npm to the lastest version by running:

```
sudo npm install npm@latest -g
```


## Windows 10: Installing Initial Requirements

#### Git installation:
1. Go to https://gitforwindows.org/ and click Download.
2. Run the installer that downloads (the .exe file) and install Git.  You can leave all options as their defaults.

#### Python3 and Pip3 installation:
1. Go to https://www.python.org/downloads/ and press "Download Python <version_number>"
2. Open the installer that downloads (the .exe file) and **select the checkbox that says "Add Python 3.8 to PATH"**
3. Click the "Install Now" button

#### Node.js and npm installation:
1. Download node.js by visiting https://nodejs.org/en/download/, and clicking the download button for the Windows Installer (.msi) version, for your computer.  Your computer is most likely 64-bit, but you can look up online to confirm.  
2. Run the installer that downloads, and keep pressing "Next" without changing any default options.  
**However, in the *Tools for Native Modules section*, make sure to select the checkbox for *"Automatically install the necessary tools....."*.**  Press Install and let the installer run.  A new script will pop up to install additional tools.  Press any key to continue, and allow Powershell to install the additional tools automatically.  

#### Bash in Powershell installation
1. Click the Start Button
2. Click Control Panel
3. Click Programs
4. Click "Turn Windows Features on or off"
5. Enable "Windows Subsystem for Linux"
6. You might be prompted to restart your computer.  

# Cloning the respository
To clone (download) the respository onto your local machine.  On Linux or MacOS, open a new terminal and run the command below.  On Windows, open Git Bash and run the command below.  
```
git clone https://github.com/cornell-cup/cs-reminibot.git
```

# Installing BaseStation Python Dependencies
Run the following commands to navigate to the basestation directory in and install the Python3 dependencies.  On Windows open PowerShell and run the following commands.  On Linux or MacOS open terminal and run the commands
```
cd cs-reminibot/basestation
pip3 install -r requirements.txt
cd ..
```
 
# Installing JavaScript Dependencies 
Run the following commands to navigate to the gui directory in static/gui and install JavaScript dependencies.
You should currently be in the cs-reminibot directory

```
cd static/gui
npm install
cd ../..
```

# Run the BaseStation
After all dependencies are successfully installed, you can run the BaseStation on your
computer and start working with the minibot.

The BaseStation is the intermediary that manages information flow between the minibot and
hardware to the software and GUI. BaseStation runs on `cs-reminibot/basestation/base_station_interface.py` and is a
simple web application that runs on HTTP.

To run the BaseStation, run the following line of code.  You should currently be in the cs-reminibot directory.

If you are on Linux or MacOS run: 
```
./run_BS.sh
```

If you are on Windows run:
```
bash run_BS.sh
```

Go to any browser on your computer and go to `localhost:8080/start` to see the GUI in action.
If you are having trouble running the previous line, make sure that python3 is installed.
You can check this by typing `python3` in your terminal.
