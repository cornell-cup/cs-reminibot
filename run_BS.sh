#!/bin/bash
set -e
trap "kill 0" EXIT

echo "================= MINIBOT CLIENT GUI ================="
cd static
cd gui
npm run webpack &
echo "================= MINIBOT BASESTATION GUI ================="
cd ..
cd ..
cd basestation
echo "=========== STARTING BASESTATION ==============="
python3 flask_app.py

