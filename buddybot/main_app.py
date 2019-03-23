from flask import Flask
from drive import Drive
app = Flask(__name__)

@app.route("/move", methods=["POST"])
def move():
    content = request.json
    direction = content['direction']
    # drive_time = content['drive_time']
    drive_time = 1 # delete this after we add drive_time field to app post request
    if direction == 'forward':
	Drive.forward(drive_time)
    elif direction == 'backward':
	Drive.backward(drive_time)
	
    print(direction)
    return direction

if __name__ == "__main__":
    app.run(host = '0.0.0.0')
