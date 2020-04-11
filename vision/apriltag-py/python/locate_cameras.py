from cv2 import *
import apriltag
import sys
import numpy as np
import time
from util import get_image, write_matrix_to_file, get_matrices_from_file, undistort_image
from util import compute_tag_undistorted_pose

BOARD_TAG_SIZE = 3.25  # The length of a side of a tag on the axis board, in inches
ORIGIN_TAG_SIZE = 6.5  # The length of a side of a tag used to calibrate the origin
# Usually 6.5 for printed tags
NUM_DETECTIONS = 4  # The number of tags to detect, usually 4


def main():
    # offsets to force (0,0) to the center of the axis calib board
    x_offset = 0
    y_offset = 0

    # Check if arguments are OK
    if len(sys.argv) != 2:
        print("Usage: {} <file name>".format(sys.argv[0]))
        exit(0)
    calib_file_name = sys.argv[1]

    camera = VideoCapture(0)  # Open the camera and set camera params
    if (not VideoCapture.isOpened(camera)):
        print("Failed to open video capture device")
        exit(0)
    camera.set(CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(CAP_PROP_FPS, 30)

    # Get matrices from file
    calib_file, camera_matrix, dist_coeffs = get_matrices_from_file(
        calib_file_name)
    calib_file.close()
    print("Read from calibration file")
    print("CAMERA MATRIX: {}".format(camera_matrix))
    print("DIST COEFFS: {}".format(dist_coeffs))
    print()
    # Initialize the detector
    detector = apriltag.Detector(searchpath=apriltag._get_demo_searchpath())
    frame = []
    gray = []
    img_points = np.ndarray((4 * NUM_DETECTIONS, 2))
    obj_points = np.ndarray((4 * NUM_DETECTIONS, 3))
    detections = []

    print("The program will now attempt to detect the 4 tags on the axis calibration board")
    print("The four tags should have a red circle on their centers if detected properly.")
    print("There will also be a blue circle in the middle of the 4 tags if 4 are detected.")
    print("Align the blue dot with the middle of the screen.")
    print("Then, press SPACE.")
    while True:
        frame = get_image(camera)  # take a new picture

        # For weird reasons, anti-distortion measures WORSENED the problem,
        # so they have been removed. If you need to put them back,
        # this is the place for it.

        # Convert undistorted image to grayscale
        gray = cvtColor(frame, COLOR_BGR2GRAY)

        # Use the detector and compute useful values from it
        detections, det_image = detector.detect(gray, return_image=True)

        x_offset = 0
        y_offset = 0

        for i in range(len(detections)):
            d = detections[i]
            id = int(d.tag_id)

            # Add to offsets
            (ctr_x, ctr_y) = d.center
            x_offset += ctr_x
            y_offset += ctr_y

            # Draw onto the frame
            cv2.circle(frame, (int(ctr_x), int(ctr_y)), 5, (0, 0, 255), 3)

        # Draw origin
        if len(detections) == 4:
            cv2.circle(frame, (int(x_offset / 4),
                               int(y_offset/4)), 5, (255, 0, 0), 3)
        imshow("Calibration board", frame)
        if cv2.waitKey(1) & 0xFF == ord(' '):
            break
        else:
            continue
    cv2.destroyAllWindows()

    # Compute transformation via PnP
    # TODO What's the reasoning from this math?
    # This was from a tutorial somehwhere and was directly
    # transcribed from the C++ system.
    for d in detections:
        id = int(d.tag_id)
        img_points[0 + 4*id] = d.corners[0]
        img_points[1 + 4*id] = d.corners[1]
        img_points[2 + 4*id] = d.corners[2]
        img_points[3 + 4*id] = d.corners[3]
        a = (id % 2) * 2 + 1
        b = -((id / 2) * 2 - 1)
        x1 = -0.5*BOARD_TAG_SIZE + a*8.5*0.5
        x2 = 0.5*BOARD_TAG_SIZE + a*8.5*0.5
        y1 = -0.5*BOARD_TAG_SIZE + b*11*0.5
        y2 = 0.5*BOARD_TAG_SIZE + b*11*0.5
        obj_points[0 + 4*id] = (x1, y1, 0.0)
        obj_points[1 + 4*id] = (x2, y1, 0.0)
        obj_points[2 + 4*id] = (x2, y2, 0.0)
        obj_points[3 + 4*id] = (x1, y2, 0.0)

    # Make transform matrices
    ret, rvec, tvec = solvePnP(
        obj_points, img_points, camera_matrix, dist_coeffs)
    dst, jac = Rodrigues(rvec)

    # Make origin to camera matrix
    """
    The origin_to_camera matrix looks like this:

    dst[0,0] dst[0,1] dst[0,2] tvec[0,0]
    dst[1,0] dst[1,1] dst[1,2] tvec[1,0]
    dst[2,0] dst[2,1] dst[2,2] tvec[2,0]
    0           0       0       1
    """
    temp = np.append(dst, tvec, axis=1)
    temp = np.append(temp, np.array([[0, 0, 0, 1]]), axis=0)
    origin_to_camera = np.asmatrix(temp)
    camera_to_origin = np.linalg.inv(origin_to_camera)
    print("CAMERA TO ORIGIN: {}".format(camera_to_origin))

    # Generate the location of the camera
    # Seems to use a homogenous coordinates system (x,y,z,k)
    gen_out = np.array([0, 0, 0, 1]).T
    camera_coordinates = np.matmul(camera_to_origin, gen_out)
    print("CAMERA COORDINATES: {}".format(camera_coordinates))

    # write matrix to file
    calib_file = open(calib_file_name, "a")
    rows, cols = np.shape(camera_to_origin)
    calib_file.write("transform_matrix =")
    write_matrix_to_file(camera_to_origin, calib_file)

    # Compute offsets via new calibration process
    print("Axis calibration was successful!")
    print("We will now center the camera. Place any apriltag where you would \
        like (0,0) to be.")
    print("A blue dot will appear in the center of the tag you placed to help \
        show where (0,0) will be set to.")
    print("When you have your tag in the right place, press SPACE.")

    while True:
        # Locate tag for use as origin
        frame = get_image(camera)
        gray = cvtColor(frame, COLOR_BGR2GRAY)
        detections, det_image = detector.detect(gray, return_image=True)

        if len(detections) == 0:
            continue
        (x_offset, y_offset, _, _) = compute_tag_undistorted_pose(
            camera_matrix, dist_coeffs, camera_to_origin, detections[0], ORIGIN_TAG_SIZE)
        cv2.circle(frame, (int(x_offset), int(y_offset)), 5, (255, 0, 0), 3)

        imshow("Origin tag", frame)
        if cv2.waitKey(1) & 0xFF == ord(' '):
            break
        else:
            continue

    # Write offsets
    # TODO make sure this works
    calib_file.write("offsets = ")
    calib_file.write(str(-1 * x_offset))
    calib_file.write(" ")
    calib_file.write(str(-1 * y_offset))
    calib_file.write("\n")

    calib_file.close()
    print("Finished writing transformation matrix to calibration file")
    pass


if __name__ == '__main__':
    main()
