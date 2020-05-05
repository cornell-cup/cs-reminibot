#!/bin/bash
set -e

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
if [ $# -eq 1 ]
then
    send_blockly_remove_server=$1
    python3 base_station_interface.py $send_blockly_remove_server
else
    python3 base_station_interface.py
fi
kill -9 $DATABASEPID 

