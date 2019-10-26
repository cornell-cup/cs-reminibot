import sys
import signal
import json
import requests
from subprocess import Popen, PIPE, STDOUT


args = str(sys.argv)
# getting arguments from command line
# type(sys.argv) = list of strings

# p is a process i.e. the coordinates sent out by the locate tags file
p = Popen(['./locate_tags.o', 'www.google.com', '1.calib'],
          stdout=PIPE, stdin=PIPE, stderr=PIPE, universal_newlines=True)


def getCoords():
    p.stdin.flush()
    locations = []
    result = []

    """
    The two arguments in sys.argv is the file name - readCoordinates.py and 
    the integer number A of april tags in view. Hence the loop below runs A times.
    """

    for i in range(0, int(sys.argv[1])):
        locations.append(p.stdout.readline())

    for i in range(0, len(locations)):
        """
        locations[i] is the coordinates of the ith april tag. (The output of 
        locate_tags for that april tag)

        You split it on whitespaces so the list stores elements as follows:
        0 - camera id
        1 - ::
        2 - tag id
        3 - ::
        4 - x
        5 - y
        6 - z
        7 - orientation angle

        We want x and z so 4 and 6. y is the distance to the camera.

        We make result as a list of dictionaries, with each dictionary storing id,
        x, y, and orientation of each tag.
        """
        stringarr = locations[i].split()
        tagid = stringarr[2]
        avgx = float(stringarr[4]) * 2/3
        avgy = float(stringarr[6]) * 2/3

        if avgx > 20:
            avgx = 20
        if avgy > 20:
            avgy = 20
        if avgx < -20:
            avgx = -20
        if avgy < -20:
            avgy = -20

        result.append({'id': str(int(tagid)), 'x': str(avgx),
                       'y': str(avgy), 'orientation': stringarr[7]})

    return result


""" gracefully exits if sent a control+C """


def sigint_handler(signal, frame):
    global p
    print("\n\nBuddybot coordinate program is exiting and terminating locate_tags, goodbye!!!!")
    p.terminate()
    sys.exit(0)


if __name__ == '__main__':
    """
    So in the infinite loop, we constatly run getCoords and post to the server the dictionary fo each april tag
    """
    while(True):
        data = getCoords()

        # gracefully exit with CTRL+C
        signal.signal(signal.SIGINT, sigint_handler)

        for i in range(len(data)):
            # js = json.dumps(data[i]) would give a string
            r = requests.post(
                url='http://192.168.4.123:8080/vision', json=data[i])
            # to check what was posted use
            # pastebin_url = r.text
            # print("The pastebin URL is:%s"%pastebin_url)
