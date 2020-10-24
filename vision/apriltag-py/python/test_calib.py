import cv2
import util

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
    cols, rows = 9, 6
    camera = get_camera()
    corners = get_checkerboard_interactive(camera,cols, rows)
    print(corners)
    cv2.waitKey(0)
    camera.release()
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
    return corners

def get_image_on_keypress(camera):
    image = None
    while True:
        image = util.get_image(camera)
        cv2.imshow("Raw Image", image)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
    return image


def get_camera():
    camera = cv2.VideoCapture(0)
    if not cv2.VideoCapture.isOpened(camera):
        raise Exception("Unable to open camera")
    camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    camera.set(cv2.CAP_PROP_FPS, 30)
    return camera


if __name__ == "__main__":
    main()
