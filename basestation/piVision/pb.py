import queue
import json
from time import sleep
import requests


class BlocklyThread:
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
            "repeat": ["start looping"],
            "end": ["end looping"],
            "stop": ["105 219 6 244"],
            "custom block": ["custom block"]
        },
        "tagRangeStart": 0,
        "tagRangeEnd": 23
    }

    # Queue of unparsed RFID hexes
    rfid_tags = queue.Queue()

    def __init__(self, bot_name: str, mode: str, pb_map: json, commands: queue):
        self.bot_name = bot_name
        self.mode = mode
        self.pb_map = json.loads(pb_map)
        self.py_commands = commands
        self.pb_stopped = False

    def get_flag(self):
        return self.pb_stopped

    # mode 0 = camera mode, 1 = real time
    def send_request(self, args):
        url = "http://localhost:8080/wheels"
        headers = {
            "Content-Type": "application/json"
        }

        data = json.dumps({
            "bot_name": self.bot_name,
            "direction": args[1],
            "power": "5",
            "mode": "physical blockly"
        })
        requests.post(url, data=data, headers=headers)

    def classify(self, command, commands):
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

    def tag_consumer(self):
        while not self.pb_stopped:
            print("worker", flush=True)
            print("queue size: " + str(self.rfid_tags.qsize()), flush=True)
            tag = self.rfid_tags.get()
            if tag in self.pb_map.keys():
                tag = self.pb_map[tag]
                task = self.classify(tag, self.commands)
                py_code = self.pythonCode[task[1]]

                if self.mode == '1':
                    if(py_code[0:3] == "bot"):
                        self.send_request(task)
                self.py_commands.put("pb:" + py_code)
                #print("working...", flush=True)
            sleep(1.0)
