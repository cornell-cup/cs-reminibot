import cv2
import argparse
import numpy as np
import sys
import time
import requests
from sqlalchemy import true
import util
from detector import Detector
from platform import node as platform_node
from random import randint
from os import environ


# Constants
DEVICE_ID = 0  # The device the camera is, usually 0. TODO make this adjustable
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720


BASE_STATION_DEVICE_ID = hash(platform_node()+str(randint(0,1000000))+environ["USER"]+str(randint(0,1000000))+str(DEVICE_ID)+str(time.time()))

def main():
    args = get_args()
    url = args["url"]
    SEND_DATA = args["url"] != None
    data_for_BS = {"DEVICE_ID": str(BASE_STATION_DEVICE_ID), "TIMESTAMP": time.time(), "DEVICE_CENTER_X": FRAME_WIDTH/2, "DEVICE_CENTER_Y": FRAME_HEIGHT/2, "position_data" : []}
    data_for_BS["position_data"].append({"id": str(d.tag_id), "image_x": ctr_x, "image_y": ctr_y,"x": x, "y": y, "orientation": angle})
    data_for_BS["TIMESTAMP"] = time.time()
    # Send the data to the URL specified.
    # This is usually a URL to the base station.
    payload = data_for_BS
    r = requests.post(url, json=payload)
    status_code = r.status_code
    if status_code / 100 != 2:
        # Status codes not starting in '2' are usually error codes.
        print(
            "WARNING: Basestation returned status code {}".format(
                status_code
            )
        )
    else:
        print(r)
        




def get_args():
    """
    Get the arguments that were passed in.
    """
    parser = argparse.ArgumentParser(description="Locate and send Apriltag poses")

    parser.add_argument(
        "-u",
        "--url",
        metavar="<url>",
        type=str,
        required=False,
        help="URL to send data to",
    ),
    parser.add_argument(
        "-i",
        "--id",
        metavar="<id>",
        type=str,
        required=False,
        help="ID of moving minibot",
    )

   
    options = parser.parse_args()
    args = vars(options)  # get dict of args parsed

    return args
    
if __name__ == "__main__":
    main()
