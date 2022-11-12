#!/bin/bash
cd vision/apriltag-py/python/
conda activate opencv_py37
python part3_tag_locate.py -f calibration.json -s 4 -u http://localhost:8080/vision