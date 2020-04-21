import cv2
import sys
import os


args = sys.argv
color = True
image_counter = 0
image_name = 'img'
path = os.getcwd() + '/images'
image_dim = (600, 600)
window_dim = (600, 600)

i = 1
while i + 1 < len(args):
    try:
        if args[i] == '-dim':
            try:
                if int(args[i+1]) < 1 or int(args[i+2]) < 1:
                    raise ValueError
                image_dim = (int(args[i+1]),int(args[i+2]))
                i += 2
            except ValueError:
                print('Expected two positive integers after \'-dim\' ')
        elif args[i] == '-window':
            try:
                if int(args[i+1]) < 100 or int(args[i+2]) < 100:
                    raise ValueError
                window_dim = (int(args[i+1]),int(args[i+2]))
                i += 2
            except ValueError:
                print('Expected two integers over 100 after \'-window\' ')
        elif args[i] == '-folder':
            path = os.getcwd() + args[i+1]
            i += 1
        elif args[i] == '-name':
            image_name = args[i+1]
            i += 1
        else:
            print('Unexpected argument \'' + args[i] + '\'')
        i += 1
    except IndexError:
        print('Expected more arguments')

cv2.namedWindow("Capture")
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    cap = cv2.VideoCapture(-1)

if not cap.isOpened():
    print("Not opening")
    exit(0)

while cap.isOpened():
    ret, frame = cap.read()
    key = cv2.waitKey(1)

    if not color:
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    frame = cv2.resize(frame, image_dim)
    frame = cv2.flip(frame, 1)
    shown_frame = cv2.resize(frame, window_dim)

    cv2.imshow('Capture', shown_frame)


    if key & 0xFF == ord('c'):
        color = not color
    if key & 0xFF == ord(' '):
        if not os.path.isdir(path):
            os.makedirs(path)
        cv2.imwrite(path + '/' + image_name + '_' + str(image_counter) + '.jpg', frame)
        image_counter = image_counter + 1
    if key & 0xFF in [27, 1048603, ord('q')]:
        break

cap.release()
cv2.destroyAllWindows()
