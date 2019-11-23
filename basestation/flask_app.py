from flask import Flask
from flask import request
import json
app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World!"


@app.route("/code/", methods=['POST', 'GET'])
def get_code():
    # data = request.get_json(silent=True)
    # print(data)
    # return data
    # value = {'key': data.get('key'), 'value': data.get(
    #     'value'), 'bot_name': data.get('bot_name')}
    # return json.dumps(value)
    data = request.get_json()
    print(data)

    return json.dumps(data)


if __name__ == "__main__":
    app.run()
