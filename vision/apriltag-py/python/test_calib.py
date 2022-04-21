import cv2
import util
import numpy as np
"""
This file qualitatively shows what happens when a
checkerboard calibration is performed.

Instructions for use:
1. Run this script with a checkerboard ready
2. When you have the checkerboard in the desired posiiton, press ENTER.
3. The system will then show three images:
  - The first image is the raw output of the camera
  - The second image shows how the checkerboard was interpreted
  - The third image shows the post-proceesed image.
"""


def main():
    # Get checkerboard
    cols, rows = 9, 6
    camera = get_camera(0)
    image, gray_image, corners = get_checkerboard_interactive(camera,cols, rows)
    print(corners)
    cv2.waitKey(0)
    camera.release()

    # Compute transform matrix
    # From tutorial:
    # https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_calib3d/py_calibration/py_calibration.html#calibration
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
    obj_points = np.zeros((rows*cols,3), np.float32)
    obj_points[:,:2] = np.mgrid[0:cols,0:rows].T.reshape(-1,2)
    img_points = cv2.cornerSubPix(gray_image, corners, (11,11), (-1,-1), criteria)
    ret, mat, dist, rvecs, tvecs = cv2.calibrateCamera(
        [obj_points],
        [img_points],
        gray_image.shape[::-1],
        None,
        None
    )
    height, width = image.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(mat, dist, (width,height), 1, (width,height))

    # Undistort
    dst = cv2.undistort(image, mat, dist, None, new_mtx)

    # Crop
    x,y,w,h = roi
    dst = dst[y:y+height, x:x+width]

    # Show new image
    cv2.imshow("Converted image", dst)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def get_checkerboard_interactive(camera, cols, rows):
    corners = None
    found_checkerboard = False
    # Get checkerboard interactively
    while True:
        image = util.get_image(camera)
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        found_checkerboard, corners = cv2.findChessboardCorners(
            gray_image, (cols, rows), None
        )
        if found_checkerboard:
            cv2.drawChessboardCorners(image, (cols, rows), corners, True)
        cv2.imshow("Checkerboard Calibration", image)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    return image, gray_image, corners

def get_image_on_keypress(camera):
    image = None
    while True:
        image = util.get_image(camera)
        cv2.imshow("Raw Image", image)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    return image


def get_camera(idx):
    camera = cv2.VideoCapture(idx)
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera")
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 30)
    return camera


if __name__ == "__main__":
    main()