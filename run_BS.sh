#!/bin/bash

echo "================= MINIBOT GUI ================="
cd static
cd gui
npm run webpack
echo "=========== WEBPACK SETUP COMPLETE ============"
cd ..
cd ..
cd basestation
echo "=========== STARTING BASESTATION ==============="
python3 base_station_interface.py
