from flask import Flask, render_template, Response, send_from_directory, request

app = Flask(__name__)

# Run the following command from terminal
# raspistill -w 160 -h 120 -n -q 5 -o ~/tmp/stream/pic.jpg -tl 40 -t 9999999 -th 0:0:0 -rot 180

@app.route('/img', methods=["POST"])
def send_file():
	#content = request.json
	#file = content["file"]
        my_file = "pic.jpg"
	return send_from_directory("/home/pi/tmp/stream", my_file)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
