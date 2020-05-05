#!/bin/bash

echo "================= MINIBOT CLIENT GUI ================="
cd static
cd gui
npm run webpack
echo "================= MINIBOT BASESTATION GUI ================="
cd ..
cd ..
cd basestation
echo "================= STARTING BLOCKLY USER PROGRAM DATABASE ================="
python3 flask_app.py &
DATABASEPID=$!
echo "=========== STARTING BASESTATION ==============="
python3 base_station_interface.py 
kill -9 $DATABASEPID 

