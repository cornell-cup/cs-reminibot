"""
Main file from which BaseStation Websocket interface begins.
"""

from flask import Flask
from flask import request, render_template, jsonify, session, redirect
from flask_api import status
import os.path
import json
import sys
import time

# Minibot imports.
from basestation.base_station import BaseStation
from basestation import app

base_station = BaseStation(app.debug)


@app.route('/start', methods=['GET'])
def start():
    """ Display the WebGUI """
    return render_template('index.html')


@app.route('/discover-bots', methods=['GET'])
def discover_bots():
    """ Get all Minibots connected to the Basestation """
    base_station.listen_for_minibot_broadcast()
    return json.dumps(True), status.HTTP_200_OK


@app.route('/active-bots', methods=['GET'])
def active_bots():
    """ Get all Minibots connected to the Basestation """
    return json.dumps(base_station.get_active_bots()), status.HTTP_200_OK


@app.route('/wheels', methods=['POST'])
def wheels():
    """ Makes the Minibot move. """
    data = request.get_json()
    bot_name = data['bot_name']
    direction = data['direction']
    power = data['power']
    base_station.move_bot_wheels(bot_name, direction, power)
    return json.dumps(True), status.HTTP_200_OK


@app.route('/script', methods=['POST'])
def script():
    """ Make Minibot run a Python script """
    data = request.get_json()
    bot_name = data['bot_name']
    script_code = data['script_code']
    base_station.send_bot_script(bot_name, script_code)
    return json.dumps(True), status.HTTP_200_OK


@app.route('/ports', methods=['POST'])
def ports():
    """ Configures which sensors and motors are connected to which ports on the 
    Minibot's PCB (Printed Circuit Board)
    """
    data = request.get_json()
    bot_name = data['bot_name']
    ports = data['ports']
    base_station.set_bot_ports(bot_name, ports)
    return json.dumps(True), status.HTTP_200_OK


@app.route('/mode', methods=['POST'])
def mode():
    """ Makes the minibot run in either line follow or object detection mode """
    data = request.get_json()
    bot_name = data['bot_name']
    mode = data['mode']
    base_station.set_bot_mode(bot_name, mode)
    return json.dumps(True), status.HTTP_200_OK


@app.route('/vision', methods=['POST', 'GET'])
def vision():
    """Updates vision status"""
    if request.method == 'POST':
        info = request.get_json()
        base_station.update_vision_log(info)
        return json.dumps(True), status.HTTP_200_OK
    else:
        return json.dumps(base_station.get_vision_data()), status.HTTP_200_OK


@app.route('/result', methods=['POST'])
def error_message_update():
    """Returns the result (either a successful execution or an error message) of running the user's code"""
    data = request.get_json()
    bot_name = data['bot_name']
    script_exec_result = base_station.get_bot_script_exec_result(bot_name)
    if not script_exec_result:
        code = -1
    elif script_exec_result == "Successful execution":
        code = 1
    else:
        code = 0
    response_dict = {"result": script_exec_result, "code": code}
    return json.dumps(response_dict), status.HTTP_200_OK


@app.route('/login/', methods=['POST'])
def login():
    """Logs the user in"""
    email = request.form['email']
    password = request.form['password']
    response_dict = {"error_msg": "", "custom_function": None}
    login_status, user_custom_function = base_station.login(email, password)
    if login_status == -1:
        response_dict["error_msg"] = "Invalid email"
        response_status = status.HTTP_401_UNAUTHORIZED
    elif login_status == 0:
        response_dict["error_msg"] = "Invalid password"
        response_status = status.HTTP_401_UNAUTHORIZED
    else:
        response_dict["custom_function"] = user_custom_function
        response_status = status.HTTP_200_OK
    return json.dumps(response_dict), response_status


@app.route('/register/', methods=['POST'])
def register_account():
    """Registers the user"""
    email = request.form['email']
    password = request.form['password']
    response_dict = {"error_msg": ""}
    login_status = base_station.register(email, password)
    if login_status == -2:
        response_dict["error_msg"] = "Email already exists"
        response_status = status.HTTP_409_CONFLICT
    elif login_status == -1:
        response_dict["error_msg"] = "Invalid email"
        response_status = status.HTTP_401_UNAUTHORIZED
    elif login_status == 0:
        response_dict["error_msg"] = "Invalid password"
        response_status = status.HTTP_401_UNAUTHORIZED
    else:
        response_status = status.HTTP_200_OK
    return json.dumps(response_dict), response_status


@app.route('/logout/', methods=['POST'])
def logout():
    """Logs the user out"""
    login_email = base_station.login_email
    if login_email == "":
        content = {'error': 'no user to logout'}
        return content, status.HTTP_400_BAD_REQUEST

    content = {'success': 'user ' + login_email + ' was logged out.'}
    login_email = ""
    return content, status.HTTP_200_OK


@app.route('/custom_function/', methods=['POST'])
def update_custom_function():
    """Updates the logged in user's custom functions"""
    custom_function = request.form['custom_function']
    is_logged_in = base_station.update_custom_function(custom_function)

    if not is_logged_in:
        return json.dumps({'error': 'Not logged in'}), status.HTTP_401_UNAUTHORIZED
    else:
        return json.dumps({'error': ''}), status.HTTP_200_OK


@app.route('/speech_recognition', methods=['POST', 'GET'])
def speech_recognition():
    """Toggles speech recognition on/off for a POST request; returns the first message 
    in the BaseStation speech recognition queue for a GET request"""
    if request.method == 'POST':
        data = request.get_json()
        bot_name = data['bot_name']
        command = data["command"]
        base_station.toggle_speech_recognition(bot_name, command)
        return json.dumps(True), status.HTTP_200_OK
    else:
        message = base_station.get_speech_recognition_status()
        return json.dumps(message), status.HTTP_200_OK
