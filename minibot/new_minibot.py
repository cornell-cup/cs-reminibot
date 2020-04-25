from hardware.communication.TCP import TCP
from socket import *
from threading import Thread
import struct
import sys
import time
import importlib
import ast
import os
# mport scripts.PiArduino as ece
# import scripts.ece_dummy_ops as ece

# for on-bot vision
from imutils.video import VideoStream
from imagezmq import imagezmq
from scripts.stoppableThreads import StoppableThread
# import picamera

# Create a UDP socket
sock = socket(AF_INET, SOCK_DGRAM)
# can bind to the same port using the same ip address
sock.setsockopt(SOL_SOCKET, SO_REUSEADDR, 1)
# can broadcast messages to all
sock.setsockopt(SOL_SOCKET, SO_BROADCAST, 1)

# address 255.255.255.255 allows you to broadcast to all
# ip addresses on the network
server_address = ('255.255.255.255', 9434)
message = 'i_am_a_minibot'

# Bot library function names
BOT_LIB_FUNCS = "PiArduino"  # "ece_dummy_ops"

# SETUP testing mode / normal mode
if (len(sys.argv) == 2) and (sys.argv[1] == "-t"):
    import scripts.ece_dummy_ops as ece
    BOT_LIB_FUNCS = "ece_dummy_ops"
else:
    import scripts.PiArduino as ece
    BOT_LIB_FUNCS = "PiArduino"


def parse_command(cmd, tcpInstance):
    """
    Parses command sent by SendKV via TCP to the bot.
    Sent from BaseStation.
    Args:
         cmd (:obj:`str`): The command name.
         tcpInstance (:obj:`str`): Payload or contents of command.
    """
    comma = cmd.find(",")
    start = cmd.find("<<<<")
    end = cmd.find(">>>>")
    key = cmd[start + 4:comma]
    value = cmd[comma + 1:end]
    botVisionClient = None
    vs = None
    if key == "WHEELS":
        if value == "forward":
            Thread(target=ece.fwd, args=[50]).start()
        elif value == "backward":
            Thread(target=ece.back, args=[50]).start()
        elif value == "left":
            Thread(target=ece.left, args=[50]).start()
        elif value == "right":
            Thread(target=ece.right, args=[50]).start()
        else:
            Thread(target=ece.stop).start()
    elif key == "MODE":
        if value == "object_detection":
            print("Object Detection")
            Thread(target=ece.ObjectDetection).start()
        elif value == "line_follow":
            print("Line Follow")
            Thread(target=ece.LineFollow).start()
    elif key == "SCRIPTS":
        # The script is always named bot_script.py.
        if len(value) > 0:
            try:
                script_name = "bot_script.py"
                program = process_string(value)

                # file_dir is the path to folder this file is in
                file_dir = os.path.dirname(os.path.realpath(__file__))
                file = open(
                    file_dir + "/scripts/" + script_name, 'w+')
                file.write(program)
                file.close()
                spawn_script_process(script_name)
            except Exception as e:
                print("Exception occured")
                print(e)
    elif key == "STARTBOTVISION":
        print("On bot vision w/ server ip: " + server_ip)
        if (botVisionClient):
            vs.start()
        else:
            botVisionClient = StoppableThread(
                target=startBotVisionClient, kwargs={'server_ip': server_ip}, daemon=True)
            botVisionClient.start()
    elif key == "STOPBOTVISION":
        if (botVisionClient):
            print("Stop on bot vision w/ server ip: " + server_ip)
            vs.stream.stream.release()

def process_string(value):
    """
    Function from /minibot/main.py. Encases programs in a function
    called run(), which can later be ran when imported via the
    import library.
    """
    cmds = value.splitlines()
    # Import modules needed for calling ECE functions
    program = "from scripts." + BOT_LIB_FUNCS + " import *\n"
    program += "import time\n"
    program += "from threading import *\n"
    program += "def run():\n"
    for i in range(len(cmds)):
        cmds[i] = cmds[i].replace(u'\xa0', u' ')
        program += "    " + cmds[i] + "\n"
    print(program)
    return program


def spawn_script_process(scriptname):
    """
    Function from /minibot/main.py. Creates a new thread to run
    the script process on.
    """
    time.sleep(0.1)
    Thread(target=run_script, args=[scriptname], daemon=True).start()


def run_script(scriptname):
    """
    Function from /minibot/main.py. Tells a bot to run a script.
    """

    # Cache invalidation and module refreshes are needed to ensure
    # the most recent script is executed
    index = scriptname.find(".")
    importlib.invalidate_caches()
    script_name = "scripts." + scriptname[0: index]
    script = importlib.import_module(script_name)
    importlib.reload(script)
    print("Reached here")
    script.run()


def start_base_station_heartbeat(ip_address):
    # Define broadcasting address and message
    server_address = (ip_address, 5001)
    heartbeat_message = 'Hello, I am a minibot!'

    # Send message and resend every 9 seconds
    while True:
        try:
            # Send data
            print('sending broadcast: "%s"' % heartbeat_message)
            sent = sock.sendto(message.encode(), server_address)
        except Exception as err:
            print(err)
        time.sleep(9)


def startBotVisionClient(server_ip):
    import socket  # import needs to be here b/c same name as "from socket ..." on line 0
    print("Entered the startBotVisionClient thread")
    global vs

    # initialize the ImageSender object with the socket address of server
    sender = imagezmq.ImageSender(connect_to="tcp://{}:5555".format(server_ip))

    # get the host name, initialize the video stream, and allow the
    # camera sensor to warmup
    rpiName = socket.gethostname()
    vs = VideoStream(usePiCamera=True, resolution=(240, 135), framerate=25)
    vs.start()
    # vs = VideoStream(src=0).start()
    time.sleep(2.0)

    while True:
        # read the frame from the camera and send it to the server
        frame = vs.read()
        sender.send_image(rpiName, frame)


try:
    server_ip = None

    # continuously try to connect to the base station
    isTimeOut = True
    while True:
        # try connecting to the basestation every sec until connection is made
        sock.settimeout(1.0)
        while (isTimeOut):
            try:
                # Send data
                print('sending: ' + message)
                sent = sock.sendto(message.encode(), server_address)
                # Receive response
                print('waiting to receive')
                data, server = sock.recvfrom(4096)
                isTimeOut = False
            except Exception as err:
                print(err)

        if data.decode('UTF-8') == 'i_am_the_base_station':
            print('Received confirmation')
            server_ip = str(server[0])
            print('Server ip: ' + server_ip)
            break
        else:
            print('Verification failed')
            print('Trying again...')

    base_station_thread = Thread(
        target=start_base_station_heartbeat, args=(server_ip,), daemon=True
    )
    base_station_thread.start()
    tcp_instance = TCP()
    while True:
        time.sleep(0.01)
        parse_command(tcp_instance.get_command(), tcp_instance)
finally:
    sock.close()
