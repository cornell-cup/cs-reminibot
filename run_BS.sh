#!/bin/bash

echo "================= MINIBOT CLIENT GUI ================="
cd static
cd gui
npm run webpack
echo "================= MINIBOT BASESTATION GUI ================="
cd ..
cd ..
cd basestation
echo "=========== STARTING BASESTATION ==============="
if [ $# -eq 1 ]
then
    send_blockly_remove_server=$1
    python base_station_interface.py $send_blockly_remove_server
else
    python base_station_interface.py
fi
