from cv2 import *
import apriltag
import numpy as np
import sys
import locate_cameras  # imported to get transform matrix and dist coeffs
# TOOD pick a library to send HTTP requests


def main():
    # TODO parse / validate args

    # TODO get matrices

    camera_matrix, dist_coeffs = \
        locate_cameras.get_matrices_from_file(sys.argv[2])

    # TODO make the detector

    # TODO make detections, print to terminal, and send to basestation
    pass


if __name__ == '__main__':
    main()
