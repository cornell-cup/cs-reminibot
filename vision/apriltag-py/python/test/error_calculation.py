import ctypes
import collections
import os
import re
import numpy
import cv2

def main():
    '''
    To streamline error calculations
    '''

    # TODO make a constant to tell the code if we should do error calculation in real time with the camera on
    # (use an if statement to do this, and can probably reuse some code from part3 to detect april tags in real time)
    # another thing is to edit the code below, so that we can perform error calculation on just the images themselves

    from argparse import ArgumentParser

    parser = ArgumentParser(
        description='Test the image against the baseline results')

    parser.add_argument('filenames', metavar='IMAGE', nargs='+',
                        help='files to scan')

    parser.add_argument('-n', '--no-gui', action='store_true',
                        help='suppress OpenCV gui')

    parser.add_argument('-d', '--debug-images', action='store_true',
                        help='output debug detection image')

    parser.add_argument('-s', '--tag-size', type=float,
                        default=1.0,
                        help='tag size in user-specified units (default=1.0)')

    add_arguments(parser)

    options = parser.parse_args()

    # set up a reasonable search path for the apriltag DLL inside the
    # github repo this file lives in;
    #
    # for "real" deployments, either install the DLL in the appropriate
    # system-wide library directory, or specify your own search paths
    # as needed.

    det = Detector(options, searchpath=_get_demo_searchpath())

    use_gui = not options.no_gui

    for filename in options.filenames:

        orig = cv2.imread(filename)
        if len(orig.shape) == 3:
            gray = cv2.cvtColor(orig, cv2.COLOR_RGB2GRAY)
        else:
            gray = orig

        detections, dimg = det.detect(gray, return_image=True)

        if len(orig.shape) == 3:
            overlay = orig // 2 + dimg[:, :, None] // 2
        else:
            overlay = gray // 2 + dimg // 2

        num_detections = len(detections)
        print('Detected {} tags in {}\n'.format(
            num_detections, os.path.split(filename)[1]))

        for i, detection in enumerate(detections):
            print('Detection {} of {}:'.format(i+1, num_detections))
            print()
            print(detection.tostring(indent=2))

            if options.camera_params is not None:

                pose, e0, e1 = det.detection_pose(detection,
                                                  options.camera_params,
                                                  options.tag_size)

                _draw_pose(overlay,
                           options.camera_params,
                           options.tag_size,
                           pose)

                print(detection.tostring(
                    collections.OrderedDict([('Pose', pose),
                                             ('InitError', e0),
                                             ('FinalError', e1)]),
                    indent=2))

            print()

        if options.debug_images:
            cv2.imwrite('detections.png', overlay)

        if use_gui:
            cv2.imshow('win', overlay)
            while cv2.waitKey(5) < 0:
                pass

# make it so that we only have to take a picture and compare the results of it to the baseline results