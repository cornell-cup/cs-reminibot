#!/bin/bash
set -e 

cd ..
# sudo apt update
sudo apt install git
sudo apt install python3-pip
sudo apt install nodejs
sudo apt install npm
sudo npm install npm@latest -g
cd cs-reminibot/basestation
pip3 install -r requirements.txt
cd ../static/gui
npm install
cd ../..
