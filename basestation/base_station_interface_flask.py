"""
Main file from which BaseStation Websocket interface begins.
"""

# import tornado
# import tornado.web
# import tornado.websocket\
from flask import Flask, request
import os.path
import json
import logging
import sys
import time
import re  # regex import
import requests

# Minibot imports.
from base_station import BaseStation
app = Flask(__name__)

base_station = BaseStation()
send_blockly_remote_server = True

# TODO: deal with secure cookies for get request
'''attempt to send cookies through separate route, but would require adding this route
to the front-end which maybe is not what we want'''
# @app.route('/getcookie')
# def get_cookie():
#   name = request.cookies.get("user_id")
#   return name

# @app.route('/setcookie', methods = ['POST', 'GET'])
# def set_cookie():
#   if request.method == 'POST':

# temporary session_id valud
session_id = "temp"
      
@app.route('/start',methods=['POST'])
def post():
  data = json.loads(request.data)
  key = data['key']

  # session_id = self.get_secure_cookie("user_id") #
  # if session_id:
  #     session_id = session_id.decode("utf-8")

  if key == "CONNECTBOT":
      bot_name = data['bot_name']
      if bot_name != None and bot_name != "":
          print("Connecting bot " + str(bot_name))
          print("session " + str(session_id))
          return json.dumps(base_station.add_bot_to_session(
              session_id, bot_name)).encode()
      else:
          print("No bot received, or bot name empty.")
  if key == "MODE":
      print("Reached MODE")
      bot_name = data['bot_name']
      mode_type = data['value']
      print("here!")
      bot_id = base_station.bot_name_to_bot_id(bot_name)
      bot = base_station.get_bot(bot_id)
      bot.sendKV(key, str(mode_type))
  elif key == "WHEELS":
      bot_name = data['bot_name']
      direction = data['direction']
      power = str(data['power'])
      bot_id = base_station.bot_name_to_bot_id(bot_name)
      base_station.move_wheels_bot(
          session_id, bot_id, direction, power)
    #   print(f"direction: {direction}, power: {power}")
  elif key == "PORTS":
      # leftmotor = data['leftmotor']
      bot_id = base_station.bot_name_to_bot_id(data['bot_name'])
      
      portarray = data['ports']
      for x in portarray:
          print(x)
      base_station.set_ports(portarray, session_id, bot_id)

  # Looks for bots on the local network to connect to.
  elif key == "DISCOVERBOTS":
      return (json.dumps(
          base_station.get_active_bots_names()).encode())

  # Receives the Blockly Generated Python scripts sent from the GUI.
  elif key == "SCRIPTS":
      print('data is:')
      print(data)
      value = data['value']
      bot_name = data['bot_name']
      params = {'bot_name': bot_name, 'value': value}

      # TODO integrate this flask app
      if send_blockly_remote_server:
          url = 'http://127.0.0.1:5000/code/'
          x = requests.post(url, json=params)
          print("Post")
          print(x.json)

          print('database test')
          url2 = 'http://127.0.0.1:5000/program/'
          x = requests.get(url2)
          print("Get")
          print(x.json)

      bot_id = base_station.bot_name_to_bot_id(bot_name)
      bot = base_station.get_bot(bot_id)
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
              send_program(bot, value)
        

  elif key == "DISCONNECTBOT":
      bot_name = data['bot']
      bot_id = base_station.bot_name_to_bot_id(bot_name)
      base_station.remove_bot_from_session(session_id, bot_id)
  elif key == "BOTSTATUS":
      bot_name = data['bot_name']
      bot_id = base_station.bot_name_to_bot_id(bot_name)
      bot = base_station.get_bot(bot_id)
      if bot:
          bot.sendKV("BOTSTATUS", '')
          # self.write(json.dumps(bot.tcp_listener_thread.status).encode())
          return json.dumps(bot.tcp_listener_thread.status).encode()
  
  return "" #catch-all return TODO: fix code structure so we don't have to do this

def send_program(bot, program):
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
              parsed_line += func + "(" + args + ")" + match.group(4) + "\n"
          parsed_program.append(parsed_line)

  parsed_program_string = "".join(parsed_program)
  print(parsed_program_string)

  # Now actually send to the bot
  bot.sendKV("SCRIPTS", parsed_program_string)



@app.route('/vision', methods=['GET'])
def vision_get():
    return json.dumps(base_station.get_vision_data()).encode()
  

@app.route('/vision', methods = ['POST'])
def vision_post():
      print(request.data)
      info = json.loads(request.data)
      base_station.update_vision_log(info)
      print()

@app.route('/heartbeat', methods = ['GET'])
def heartbeat_update():
    time_interval = 1
    is_heartbeat = base_station.is_heartbeat_recent(time_interval)
    heartbeat_json = {"is_heartbeat": is_heartbeat}
    return json.dumps(heartbeat_json).encode()



@app.route('/result', methods = ['POST'])
def error_message_update():
    data = json.loads(request.data)
    bot_name = data['bot_name']
    error_message = base_station.get_error_message(bot_name)
    while not error_message:
        error_message = base_station.get_error_message(bot_name)
    if error_message == "Successful execution":
        error_json = {"error": error_message, "code": 1}
    else:
        error_json = {"error": error_message, "code": 0}
    print("error_json is: ")
    print(error_json)
    return json.dumps(error_json).encode()


if __name__ == "__main__":
    """
    Main method for running base station Server.
    """
    # base_station_server = BaseInterface(8080, send_blockly_remote_server=True)
    # base_station_server.start()
    app.run()
    
