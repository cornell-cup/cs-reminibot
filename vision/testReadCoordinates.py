"""
Test Flask Application for readCoordinates.py.
By setting the server you can test the communication of your
readCoordinates.py file and the server its posting to.

"""


from flask import Flask, render_template, Response, request
import json
import requests
app = Flask(__name__)


@app.route('/vision', methods=['POST'])
def home():
    # print(request)
    # print(request.get_data())
    data = request.get_json()
    print(data)
    # l = [{"k":1, "w":2}, {"w":1, "g":2}]
    # for x in range(len(l)):
    #     js = json.dumps(l[x])
    return "a"


if __name__ == '__main__':
    app.run()
