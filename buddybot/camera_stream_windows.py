from flask import Flask, render_template, Response, send_from_directory, request
from cv2 import *


app = Flask(__name__)
cam = VideoCapture(0)

@app.route('/stream.jpg')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        frame = camera.get_frame()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video.jpg')
def video_feed():
    return Response(gen(Camera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/img', methods=["POST"])
def send_file():
	content = request.json
	file = content["file"]
	s, img = cam.read()
	imwrite(file,img)
	return send_from_directory("C:\\Users\\vvire\\Downloads\\cam_stream", file)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
