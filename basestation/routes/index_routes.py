"""
Main file from which BaseStation Websocket interface begins.
"""

from flask import Flask
from flask import Blueprint, request, render_template, jsonify, session, redirect
from flask_api import status
import os.path
import json
import sys
import time

# Minibot imports.
from .basestation_init import base_station
from flask import current_app

# base_station = BaseStation(False)

# Error messages
NO_BOT_ERROR_MSG = "Please connect to a bot!"

index_bp = Blueprint('index',
                     __name__,
                     url_prefix='/')


@index_bp.route('/start', methods=['GET'])
def start():
    """ Display the WebGUI """
    return render_template('index.html')


@index_bp.route('/ping', methods=['GET'])
def ping_pong():
    print("pinggggggg")
    return jsonify({
        'status': 'Epic success',
        'message': 'pong!'
    })


@index_bp.route('/discover-bots', methods=['GET'])
def discover_bots():
    """ Get all Minibots connected to the Basestation """
    base_station.listen_for_minibot_broadcast()
    return json.dumps(True), status.HTTP_200_OK


@index_bp.route('/active-bots', methods=['GET'])
def active_bots():
    """ Get all Minibots connected to the Basestation """
    return json.dumps(base_station.get_active_bots()), status.HTTP_200_OK


@index_bp.route('/wheels', methods=['POST'])
def wheels():
    """ Makes the Minibot move. """
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    direction = data['direction']
    power = data['power']
    base_station.move_bot_wheels(bot_name, direction, power)
    return json.dumps(True), status.HTTP_200_OK


@index_bp.route('/script', methods=['POST'])
def script():
    """ Make Minibot run a Python script """
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    script_code = data['script_code']
    base_station.send_bot_script(bot_name, script_code)
    return json.dumps(True), status.HTTP_200_OK


@index_bp.route('/ports', methods=['POST'])
def ports():
    """ Configures which sensors and motors are connected to which ports on the 
    Minibot's PCB (Printed Circuit Board)
    """
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    ports = data['ports']
    base_station.set_bot_ports(bot_name, ports)
    return json.dumps(True), status.HTTP_200_OK


@index_bp.route('/mode', methods=['POST'])
def mode():
    """ Makes the minibot run in either line follow or object detection mode """
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    mode = data['mode']
    base_station.set_bot_mode(bot_name, mode)
    return json.dumps(True), status.HTTP_200_OK


@index_bp.route('/vision', methods=['POST', 'GET'])
def vision():
    """Updates vision status"""
    if request.method == 'POST':
        info = request.get_json()
        base_station.update_vision_log(info)
        return json.dumps(True), status.HTTP_200_OK
    else:
        return json.dumps(base_station.get_vision_data()), status.HTTP_200_OK


@index_bp.route('/result', methods=['POST'])
def error_message_update():
    """Returns the result (either a successful execution or an error message) of running the user's code"""
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    script_exec_result = base_station.get_bot_script_exec_result(bot_name)
    if not script_exec_result:
        code = -1
    elif script_exec_result == "Successful execution":
        code = 1
    else:
        code = 0
    response_dict = {"result": script_exec_result, "code": code}
    return json.dumps(response_dict), status.HTTP_200_OK


@index_bp.route('/login', methods=['POST'])
def login():
    print("logged in")
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


@index_bp.route('/register', methods=['POST'])
def register_account():
    """Registers the user"""
    print("register route")
    print(request.form)
    email = request.form['email']
    print("email", email)
    password = request.form['password']
    print("password", password)
    response_dict = {"error_msg": ""}

    # response_status = status.HTTP_200_OK
    # return json.dumps(response_dict), response_status

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


@index_bp.route('/logout/', methods=['POST'])
def logout():
    print("logged out")
    """Logs the user out"""
    login_email = base_station.login_email
    if login_email == "":
        content = {'error': 'no user to logout'}
        return content, status.HTTP_400_BAD_REQUEST

    content = {'success': 'user ' + login_email + ' was logged out.'}
    base_station.login_email = ""
    return content, status.HTTP_200_OK


@index_bp.route('/custom_function/', methods=['POST'])
def update_custom_function():
    """Updates the logged in user's custom functions"""
    custom_function = request.form['custom_function']
    is_logged_in = base_station.update_custom_function(custom_function)

    if not is_logged_in:
        return json.dumps({'error': 'Not logged in'}), status.HTTP_401_UNAUTHORIZED
    else:
        return json.dumps({'error': ''}), status.HTTP_200_OK


@index_bp.route('/speech_recognition', methods=['POST', 'GET'])
def speech_recognition():
    """Sends the voice command to the connected minibot."""
    if request.method == 'POST':
        data = request.get_json()
        bot_name = data['bot_name']
        if not bot_name:
            # error_json = {"error_msg": NO_BOT_ERROR_MSG}
            # return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
            print(data["command"])
        command = data["command"]
        print("sent command: " + command)
        base_station.send_command(bot_name, command)
        return json.dumps(True), status.HTTP_200_OK
    else:
        return json.dumps(), status.HTTP_200_OK
