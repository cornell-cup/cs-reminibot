#!/bin/bash

cd ../..

# installing brew
echo "Installing brew."
sleep 5
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# general dependencies installation
echo "Installing general dependencies."
sleep 5
brew update 
brew upgrade 
brew cleanup
brew install git
brew install python
brew install node
sudo chown -R $(whoami) ~/.npm
npm install npm@latest -g
brew install portaudio
brew install --cask anaconda
brew install cmake

# basestation dependecnies installation
echo "Installing basestation dependencies."
sleep 5
cd cs-reminibot/basestation

# Attempting normal basestation dependencies installation.
echo "Attempting normal basestation dependencies installation."
sleep 5
pip3 install -r requirements.txt

# Attempting to install scipy with brew.
echo "Attempting to install scipy with brew."
sleep 5
brew install scipy

# Attempting normal basestation dependencies installation again.
echo "Attempting normal basestation dependencies installation again."
sleep 5
pip3 install -r requirements.txt

# Attempting manual basestation dependencies installation with correct versions.
echo "Attempting manual basestation dependencies installation with correct versions."
sleep 5
pip3 install bcrypt==3.1.7   
pip3 install cffi==1.14.5
pip3 install click==6.7        
pip3 install Flask==1.1.1     
pip3 install Flask-API==2.0
pip3 install Flask-SQLAlchemy==2.4.1    
pip3 install itsdangerous==0.24
pip3 install Jinja2==2.10.1
pip3 install pycparser==2.19
pip3 install python-dotenv==0.15.0
pip3 install six==1.11.0            
pip3 install requests==2.22.0     
pip3 install SQLAlchemy==1.3.13    
pip3 install urllib3==1.25.8    
pip3 install Werkzeug==1.0.0
pip3 install pyaudio==0.2.11
pip3 install SpeechRecognition==3.8.1
pip3 install pint
pip3 install control

# Attempting manual basestation dependencies installation with any versions.
echo "Attempting manual basestation dependencies installation with any versions."
sleep 5
pip3 install bcrypt   
pip3 install cffi
pip3 install click        
pip3 install Flask     
pip3 install Flask-API
pip3 install Flask-SQLAlchemy  
pip3 install itsdangerous
pip3 install Jinja2
pip3 install pycparser
pip3 install python-dotenv
pip3 install six            
pip3 install requests     
pip3 install SQLAlchemy  
pip3 install urllib3   
pip3 install Werkzeug
pip3 install pyaudio
pip3 install SpeechRecognition
pip3 install pint
pip3 install control

# Attempting installing pyaudio with anaconda.
echo "Attempting installing pyaudio with anaconda."
sleep 5
conda install pyaudio

cd ..

# GUI dependencies installation
cd static/gui

# Attempting normal GUI dependencies installation.
echo "Attempting normal GUI dependencies installation." 
sleep 5
npm install

# Attempting forceful GUI dependencies installation.
echo "Attempting forceful GUI dependencies installation." 
sleep 5
npm install --force

cd ../..

# Vision system dependencies installation
cd vision/apriltag-py/python

# Attempting to install Vision dependencies.
echo "Attempting to install Vision dependencies."
sleep 5
pip3 install -r requirements.txt

# Attempting to install AprilTag dependencies.
echo "Attempting to install AprilTag dependencies."
sleep 5
cd ..
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j4

sudo make install

cd ../../../installation_scripts