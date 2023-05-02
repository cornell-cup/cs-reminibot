import cv2
import sys
sys.path.append('..')
from util import util
import numpy as np
from constants import VISION_FPS, FRAME_WIDTH, FRAME_HEIGHT


def main():
    # Get checkerboard
    cols, rows = 9, 6
    camera = get_camera()
    image, gray_image, corners = get_checkerboard_interactive(
        camera, cols, rows)
    print(corners)
    cv2.waitKey(0)
    camera.release()

    # Compute transform matrix
    # From tutorial:
    # https://opencv-python-tutroals.readthedocs.io/en/latest/py_tutorials/py_calib3d/py_calibration/py_calibration.html#calibration
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, VISION_FPS, 0.001)
    obj_points = np.zeros((6*9, 3), np.float32)
    obj_points[:, :2] = np.mgrid[0:9, 0:6].T.reshape(-1, 2)
    img_points = cv2.cornerSubPix(
        gray_image, corners, (11, 11), (-1, -1), criteria)
    ret, mat, dist, rvecs, tvecs = cv2.calibrateCamera(
        [obj_points],
        [img_points],
        gray_image.shape[::-1],
        None,
        None
    )
    
    height, width = image.shape[:2]
    new_mtx, roi = cv2.getOptimalNewCameraMatrix(
        mat, dist, (width, height), 1, (width, height))

    # Undistort
    dst = cv2.undistort(image, mat, dist, None, new_mtx)

    # Crop
    x, y, w, h = roi
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


def get_camera():
    camera = cv2.VideoCapture(0)
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera")
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    camera.set(cv2.CAP_PROP_FPS, VISION_FPS)
    return camera


if __name__ == "__main__":
    main()

# def main():
#     camera = get_camera()

#     while True:
#         ret, frame = camera.read()

#         k = cv2.waitKey(1)

#         if ret == True:
#             # elif k % 256 == 32:

#             get_checkerboard_interactive(camera, 9, 6)

#             # cv2.waitKey(0)
#             # img_name = "captured_image.png"
#             # cv2.imwrite(img_name, frame)
#             # print("{} written!".format(img_name))

#     camera.release()
#     # cv2.destroyAllWindows()
#     cv2.destroyWindow("image capture")


# def get_camera():
#     camera = cv2.VideoCapture(0)
#     if not cv2.VideoCapture.isOpened(camera):
#         raise Exception("Unable to open camera")
#     camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
#     camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
#     camera.set(cv2.CAP_PROP_FPS, 30)
#     return camera


# def get_checkerboard_interactive(camera, cols, rows):
#     corners = None
#     found_checkerboard = False
#     # Get checkerboard interactively
#     while True:
#         image = util.get_image(camera)
#         gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
#         found_checkerboard, corners = cv2.findChessboardCorners(
#             gray_image, (cols, rows), None
#         )
#         if found_checkerboard:
#             cv2.drawChessboardCorners(image, (cols, rows), corners, True)
#         cv2.imshow("Checkerboard Calibration", image)
#         k = cv2.waitKey(1)

#         if k % 256 == 32:
#             print("Image is captured")
#             print("Press ESP to quit, any other key to recapture")
#             a = cv2.waitKey(0)
#             if a % 256 == 27:
#                 print("Quitting. \n")
#                 break

#     return image


# if __name__ == '__main__':
#     main()
