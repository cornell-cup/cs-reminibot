# MiniBot Platform

Minibot is a modular robotics kit designed for students from age 6 - 18
developed in partnership with DaVinci Robotics. This repository contains 
a web app for controlling the Minibot and sample
scripts that allow users to run simple algorithms on their Minibot.

This repository is currently in development.

# 1. Initial Requirements

Please install the following:

Note: Windows users are highly recommended to install on Windows Native rather than Ubuntu WSL.

- Git ([Ubuntu](#Ubuntu_git) | [MacOS](#Mac_git) | [Windows 10](#Windows_git))
- Python version 3.8 or later & pip3 ([Ubuntu](#Ubuntu_python) | [MacOS](#Mac_python) | [Windows 10](#Windows_python))
- [Anaconda](https://www.anaconda.com/) (Optional but recommended for advanced users) ([MacOS](#Mac_conda) | [Windows 10](#Windows_conda))
- Cmake ([MacOS](#Mac_cmake) | [Windows 10](#Windows_cmake))
- Node.js (the Javascript runtime library) and npm (the Javascript package manager) ([Ubuntu](#Ubuntu_node) | [MacOS](#Mac_node) | [Windows 10](#Windows_node))
- Windows only - [Build Tools for Visual Studio 2022](https://aka.ms/vs/17/release/vs_BuildTools.exe)

**Click on the links below for Operating System-specific guides on how to install the above dependencies:**

[Ubuntu 18 Installing Initial Requirements guide](#Ubuntu)

[Mac OS Installing Initial Requirements guide](#MacOS)

[Windows 10 Installing Initial Requirements guide](#Windows)

<a name="Continue"></a>

# 2. Cloning the respository

Please clone (download) the respository onto your local machine. On Windows open Powershell or WSL (Windows Subsystem for Linux) and run the following command. On Linux or MacOS open the terminal and run the command.

```
git clone https://github.com/cornell-cup/cs-reminibot.git
```

# 3. Installing BaseStation Python Dependencies

Please choose either Anaconda OR Base environment installation.


<a name="conda_install"></a>

## Anaconda environment package installation (highly recommended)

Anaconda is a Python environment and package manager.

After installing Anaconda, create a new Python 3.8 Anaconda environment named `cup` with the following command in your shell:

```
conda create -n cup python=3.8
```

To activate this environment and install the required Python packages, run the following commands:
```
conda activate cup
python -m pip install basestation/requirements.txt
```

Note: After installing the packages within the Anaconda environment, you **must run** `conda activate cup` on a newly opened shell window to activate the environment before starting the GUI. You'll know the environment is activated if the name of the environment `(cup)` is displayed before the shell prompt. Example of what the Windows Powershell prompt should look like: `(cup) C:\Users\YourName`

The command to deactivate the current environment and return to the base environment is `conda deactivate`.


## Base environment package installation

Run the following commands to navigate to the basestation directory in and install the Python3 dependencies. On Windows open Windows Powershell and run the following commands. On Linux or MacOS open terminal and run the following commands:

```
python -m pip install -r basestation/requirements.txt
cd ..
```


# 3. Installing JavaScript Dependencies

Navigate to the cs-reminibot directory and run the following commands to navigate to the gui directory in static/gui and install the JavaScript dependencies.

```
cd static/gui
npm install
cd ../..
```

# 4. Installing the Vision System


## Setting Up Vision System (Windows)

See **Vision System Troubleshooting** section of this [troubleshooting guide](https://docs.google.com/document/d/17iD53BYdfiRP9ht-XtAxGYFpu55B4e1CCysB0ldnopU/edit?usp=sharing) for visual steps

1. Open **cs-reminibot** directory in File Explorer.
2. Navigate to the **installation_scripts** directory.
3. Right click on the **Vision_system_install** file.
4. Select the **Open with** option from the resulting drop down.
5. Select the **Git for Windows** option from the resulting sub-drop down

## Setting Up Vision System (MacOS/Linux)

Run the following commands to navigate to the apriltag-py directory in vision/apriltag-py and install JavaScript dependencies.
On Linux or MacOS open terminal and run the commands. You should currently be in the cs-reminibot directory

```
cd vision/apriltag-py
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4
sudo make install
cd ../..
```

# 6. Running the BaseStation & WebGUI
After all dependencies are successfully installed, you can run the WebGUI on your computer and start working with the Minibot.

From the terminal, navigate to the home `cs-reminibot` directory and run the following command.

Note: Anaconda users should activate the `cup` environment before running the GUI.

```
./run_bs.sh
```

Wait until you see the message _======= STARTING BASESTATION========_ in your terminal. Open Google Chrome and go to [localhost:8080/start](localhost:8080/start) to see the GUI in action.

Windows users who are having trouble with this step can try [installing the python dependencies via Anaconda](#conda_install).

To stop running the program, press Ctrl+C in the terminal window.

# 7. Starting a virtual Minibot

The following script in the `minibot` directory starts up a virtual Minibot to send messages to the BaseStation.

```
cd minibot
python minibot.py -t
```
To stop running the program, press Ctrl+C in the terminal window.

# 8. Running the Vision System

To run the Vision system, run the following command. You should currently be in the cs-reminibot directory.

**On Windows**

```
./run_vision.sh
```

**On MacOS/Linux**

```
cd vision/apriltag-py/python
python3 calibrationgui.py
cd ../../..
```

---

# 1a. Operating System-Specific Guides to Install Initial Requirements

<a name="Ubuntu"></a>

## Ubuntu 18: Installing Initial Requirements

<a name="Ubuntu_git"></a>

#### Git installation

In a terminal run:

```
sudo apt install git
```
<a name="Ubuntu_python"></a>

#### Python3 installation

Python 3 should already be installed. Run the following command in a terminal and you should see the python interpreter open.

```
python3
```

Run quit() in the interpreter to exit out of it.

#### Pip3 installation

In a terminal run:

```
sudo apt install python3-pip
```

<a name="Ubuntu_node"></a>

#### Node.js and npm installation

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

[Continue with the remaining installation steps](#Continue)

<a name="MacOS"></a>

## MacOS: Installing Initial Requirements

#### Homebrew installation

1. Press _Cmd + Space_ to open Spotlight Search. Search for Terminal and open it.
2. Visit brew.sh in your browser to install Homebrew. Copy the command specified in the installation section into your terminal and run it.
3. After installation is complete, run the following command in your terminal:

```
brew upgrade
```

#### Git installation

In a terminal run:

```
brew install git
```

<a name="Mac_python"></a>

#### Python3 and Pip3 installation

In a terminal run:

```
brew install python
```

<a name="Mac_conda"></a>
#### Anaconda installation (optional but recommended)

Installing Anaconda is recommended for advanced users in order to simplify Python version and package management.

Follow the instructions to install Anaconda through homebrew found [here](https://formulae.brew.sh/cask/anaconda).

<a name="Mac_node"></a>

#### Node.js and npm installation

In a terminal run:

```
brew install node
```

Upgrade npm to the lastest version by running:

```
npm install npm@latest -g
```
<a name="Mac_cmake"></a>

#### CMake installation

In a terminal run:

```
brew install cmake
```

[Continue with the remaining installation steps](#Continue)

<a name="Windows"></a>

## Windows 10 (Native): Installing Initial Requirements

<!-- Follow the steps in the **Installation** section of the [troubleshooting guide](https://docs.google.com/document/d/17iD53BYdfiRP9ht-XtAxGYFpu55B4e1CCysB0ldnopU/edit?usp=sharing). -->


<a name="Windows_git"></a>

#### Git installation

Follow the instructions under **Install Git on Windows** found [here](https://github.com/git-guides/install-git).

<a name="Windows_python"></a>

#### Python and Pip installation
Download the official Python distribution found [here](https://www.python.org/downloads/). This step should install pip automatically.

After proper installation of Python and pip, the following commands should show the installed version, such as `Python 3.8.0` and `pip 21.2.4 from C:\Users\User\...`.
```
python --version
python -m pip --version
```

<a name="Windows_conda"></a>

#### Anaconda installation (optional but recommended)

Installing Anaconda is recommended to simplify Python version and package management.

Download the official Anaconda distribution found [here](https://www.anaconda.com/products/distribution).


<a name="Windows_cmake"></a>

#### CMake installation

Download and install the official CMake distribution found [here](https://cmake.org/download/).

<a name="Windows_node"></a>

#### NodeJS and npm installation

Please follow the official Windows NodeJS and npm installation instructions found [here](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).

<!-- 
## Windows 10 (WSL): Installing Initial Requirements

#### Windows Subsystem for Linux Installation

1. Click on Start (or press _Windows Key + S_) to open the Windows Search Bar, and search for "Windows Features". Select "Turn Windows Features on or off".
2. Select **Windows Subsystem for Linux** and click OK. You will be prompted to restart your computer. Please do so.
3. Open the Microsoft Store app and search for Ubuntu 18.04 LTS. Please install it. (If this doesn't work look at the steps after step 6)
4. After installation, click launch. You will be prompted to _"press any key to continue"_ and then to create a username and password. Please do these things. Your username can only consist of lowercase alphabetical characters.
5. You now have WSL (Windows Subsystem for Linux) installed. Please run:

```
lsb_release -a
```

to confirm the installation was successful. You should see _Ubuntu_ in the Description section of the output.  
6. You can start WSL anytime by typing _wsl_ in your windows search bar and choosing the prompted command.

If you are unable to install Windows Subsystem for Linux through the Microsoft Store please follow the steps here:

1. Installation: https://docs.microsoft.com/en-us/windows/wsl/install-manual
2. Initialization: https://docs.microsoft.com/en-us/windows/wsl/initialize-distro

#### Git installation:

In Windows Subsytem for Linux run:

```
sudo add-apt-repository ppa:git-core/ppa
sudo apt update && upgrade
sudo apt install git
```

While running these commands you will be prompted to enter your _sudo_ password. This password is the same password that you configured when installing WSL.

#### Python3 and Pip3 installation:

In Windows Subsytem for Linux run:

```
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

[Continue with the remaining installation steps](#Continue) -->

# 5. Common Problems & Fixes

Please see the [Minibot Software Install Troubleshooting Guide](https://docs.google.com/document/d/17iD53BYdfiRP9ht-XtAxGYFpu55B4e1CCysB0ldnopU/edit#heading=h.k4oli3pdzdzn) for common installation problems.

#### ERROR: EACCES when trying to run npm commands

Try running the following command to fix this:

```
sudo chown -R $(whoami) ~/.npm
```

And then run your npm command with sudo in front of it if it still doesn't work. For example:

```
sudo npm install
```