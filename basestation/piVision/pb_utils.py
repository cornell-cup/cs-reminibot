import json
import requests

pythonCode = {
    "forward": "bot.move_forward(100)",
    "backward": "bot.move_backward(100)",
    "stop": "bot.stop()",
    "right": "bot.turn_clockwise(100)",
    "left": "bot.turn_counter_clockwise(100)",
    "repeat": "for i in range(n):",
    "end": "end",
    "custom block": "#custom block no.n"
}

commands = {
    "commands": {
        "turn left": ["89 227 11 244"],
        "turn right": ["89 200 6 244"],
        "go forwards": ["249 62 4 244"],
        "go backwards": ["201 18 13 244"],
        "stop": ["105 219 6 244"],
        #repeat, end, and custom block have dummy tags, same as dummy_ops2 and physical_blockly
        "repeat": ["9 110 7 244"],
        "end": ["201 127 7 244"],
        "custom block": ["153 252 7 244"]
    },
    "tagRangeStart": 0,
    "tagRangeEnd": 23
}

def send_request(bot_name, args):
    url = "http://localhost:8080/wheels"
    headers = {
        "Content-Type": "application/json"
    }

    data = json.dumps({
        "bot_name": bot_name,
        "direction": args[1],
        "power": "5",
        "mode": "physical blockly"
    })
    requests.post(url, data=data, headers=headers)

def classify(command, commands):
        if command in commands["commands"]["turn left"]:
            return ["fake_bot", "left"]
        elif command in commands["commands"]["turn right"]:
            return ["fake_bot", "right"]
        elif command in commands["commands"]["go forwards"]:
            return ["fake_bot", "forward"]
        elif command in commands["commands"]["go backwards"]:
            return ["fake_bot", "backward"]
        elif command in commands["commands"]["repeat"]:
            return ["fake_bot", "repeat"]
        elif command in commands["commands"]["end"]:
            return ["fake_bot", "end"]
        elif command in commands["commands"]["custom block"]:
            return ["fake_bot", "custom block"]
        else:
            # do nothing if invalid command received
            return ["fake_bot", "stop"]
