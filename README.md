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

#### Windows Subsystem for Linux Installation
1. Click on Start (or press *Windows Key + S*) to open the Windows Search Bar, and search for "Windows Features".  Select "Turn Windows Features on or off".
2. Select **Windows Subsystem for Linux** and click OK.  You will be prompted to restart your computer.  Please do so.  
3. Open the Microsoft Store app and search for Ubuntu 18.04 LTS.  Please install it.
4. After installation, click launch.  You will be prompted to *"press any key to continue"* and then to create a username and password.  Please do these things.  
5. You now have WSL (Windows Subsystem for Linux) installed.  Please run:
```
lsb_release -a
```
to confirm the installation was successful.  You should see *Ubuntu* in the Description section of the output.  
6. You can start WSL anytime by typing *wsl* in your windows search bar and choosing the prompted command.  

#### Git installation:
In Windows Subsytem for Linux run:
```
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
sudo apt install git
```
While running these commands you will be prompted to enter your *sudo* password.  This password is the same password that you configured when installing WSL.  

#### Python3 and Pip3 installation:
In Windows Subsytem for Linux run:
```
sudo apt update && upgrade
sudo apt install python3 python3-pip
```

#### Node.js and npm installation:
In Windows Subsytem for Linux run:
```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Upgrade npm to the lastest version by running:

```
sudo npm install npm@latest -g
```

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
npm install --save-dev @testing-library/react
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
