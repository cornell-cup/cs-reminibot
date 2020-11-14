from base_station import BaseStation
import re
import json


class BaseStationInterface:
    def __init__(self):
        self.base_station = BaseStation()

    def add_session(self):
        return str(self.base_station.add_session())

    def connect_bot(self, bot_name: str, session_id: str):
        # bot_name = request.form.get('bot_name')
        if bot_name != None and bot_name != "":
            print("Connecting bot " + bot_name)
            print("session " + session_id)
            return json.dumps(self.base_station.add_bot_to_session(
                session_id, bot_name)).encode()
        else:
            print("No bot received, or bot name empty.")

    def mode(self, bot_name: str, mode_type: str):
        print("here!")
        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        bot = self.base_station.get_bot(bot_id)
        bot.sendKV("MODE", str(mode_type))

    def wheels(self, bot_name: str, direction: str, power: int, session_id: str):
        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        self.base_station.move_wheels_bot(
            session_id, bot_id, direction, power)

    def ports(self, session_id: str, bot_id: str, portarray):
        for x in portarray:
            print(x)
        self.base_station.set_ports(portarray, session_id, bot_id)

    def discoverbots(self):
        return (json.dumps(
            self.base_station.get_active_bots_names()).encode())

    def scripts(self, bot_name, value):
        params = {'bot_name': bot_name, 'value': value}

        # TODO integrate this flask app
        # if send_blockly_remote_server:
        #     url = 'http://127.0.0.1:5000/code/'
        #     x = requests.post(url, json=params)
        #     print("Post")
        #     print(x.json)

        #     print('database test')
        #     url2 = 'http://127.0.0.1:5000/program/'
        #     x = requests.get(url2)
        #     print("Get")
        #     print(x.json)

        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        bot = self.base_station.get_bot(bot_id)
        # reset the previous script's error message, so we can get the new error message
        # of the new script
        bot.set_result(None)
        if bot:
            print("Code len = " + str(len(value)))
            print(type(bot))
            if len(value) == 0:
                print("GETTING SCRIPTS")
                bot.sendKV("SCRIPTS", '')
            elif len(value) == 1:
                print("SENDING SCRIPTS")
                bot.sendKV("SCRIPTS", value[0])
            elif len(value) == 2:
                print("SAVING SCRIPTS")
                bot.sendKV("SCRIPTS", ",".join(value))
            else:
                # TODO check if a "long enough" program
                # is supposed to be sent over
                print("RUNNING SCRIPT")
                # self.send_program(bot, value)
                self.send_program(bot, value)

    def disconnectbot(self, bot_name: str, session_id):
        bot_id = base_station.bot_name_to_bot_id(bot_name)
        self.base_station.remove_bot_from_session(session_id, bot_id)

    def botstatus(self, bot_name: str):
        bot_id = self.base_station.bot_name_to_bot_id(bot_name)
        bot = self.base_station.get_bot(bot_id)
        if bot:
            bot.sendKV("BOTSTATUS", '')
            return json.dumps(bot.tcp_listener_thread.status).encode()

    def heartbeat(self):
        time_interval = 1
        is_heartbeat = self.base_station.is_heartbeat_recent(time_interval)
        heartbeat_json = {"is_heartbeat": is_heartbeat}
        return json.dumps(heartbeat_json).encode()

    def send_program(self, bot, program):
        """
        Sends the program received from Blockly to the bot, translated
        into ECE-supplied functions.

        Args:
            bot: The pi_bot to send to
            program: The string containing the python code generated
            from blockly

        """

        # function_map : Blockly functions -> ECE functions
        function_map = {
            "move_forward": "fwd",
            "move_backward": "back",
            "wait": "time.sleep",
            "stop": "stop",
            "set_wheel_power": "ECE_wheel_pwr",
            "turn_clockwise": "right",
            "turn_counter_clockwise": "left",
            "read_ultrasonic": "read_ultrasonic",
            "move_servo": "move_servo",
        }

        # functions that run continuously, and hence need to be started
        # in a new thread on the Minibot otherwise the Minibot will get
        # stuck in an infinite loop and will be unable to receive
        # other commands
        threaded_functions = [
            "fwd",
            "back",

            "stop",
            "ECE_wheel_pwr",
            "right",
            "left",
        ]

        # Regex is for bot-specific functions (move forward, stop, etc)
        # 1st group is the whitespace (useful for def, for, etc),
        # 2nd group is for func name, 3rd group is for args,
        # 4th group is for anything else (additional whitespace,
        # ":" for end of if condition, etc)
        pattern = r"(.*)bot.(\w*)\((.*)\)(.*)"
        regex = re.compile(pattern)
        program_lines = program.split('\n')
        parsed_program = []
        for line in program_lines:
            match = regex.match(line)
            if not match:
                parsed_program.append(line + '\n')  # "normal" python
            else:
                func = function_map[match.group(2)]
                args = match.group(3)
                whitespace = match.group(1)
                if not whitespace:
                    whitespace = ""
                parsed_line = whitespace
                if func in threaded_functions:
                    parsed_line += "Thread(target={}, args=[{}]).start()\n".format(
                        func, args)
                else:
                    parsed_line += func + \
                        "(" + args + ")" + match.group(4) + "\n"
                parsed_program.append(parsed_line)

        parsed_program_string = "".join(parsed_program)
        print(parsed_program_string)

        # Now actually send to the bot
        bot.sendKV("SCRIPTS", parsed_program_string)

    def error_message_update(self, bot_name: str):
        error_message = self.base_station.get_error_message(bot_name)
        while not error_message:
            error_message = self.base_station.get_error_message(bot_name)
        if error_message == "Successful execution":
            error_json = {"error": error_message, "code": 1}
        else:
            error_json = {"error": error_message, "code": 0}
        print("error_json is: ")
        print(error_json)
        return json.dumps(error_json).encode()
