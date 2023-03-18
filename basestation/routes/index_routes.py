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
import datetime

# Minibot imports.
from .basestation_init import base_station
from flask import current_app

# base_station = BaseStation(False)

# Error messages
NO_BOT_ERROR_MSG = "Please connect to a Minibot!"
submission_id = None

index_bp = Blueprint('index',
                     __name__,
                     url_prefix='/')

def get_basestation():
    raise Exception(hex(id(base_station)) + "!!!!!!!!!!!!!!!")
    return base_station

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

@index_bp.route('/get-py-command', methods=['GET'])
def get_py_command(): 
    v = base_station.get_next_py_command()
    return json.dumps(v)

@index_bp.route('/active-bots', methods=['GET'])
def active_bots():
    """ Get all Minibots connected to the Basestation """
    # print(hex(id(base_station)))
    return json.dumps(base_station.get_active_bots()), status.HTTP_200_OK


@index_bp.route('/wheels', methods=['POST'])
def wheels():
    """ Makes the Minibot move. """
    data = json.loads(request.data, strict=False)
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
    global submission_id
    data = request.get_json()
    bot_name = data['bot_name']
    if not bot_name:
        error_json = {"error_msg": NO_BOT_ERROR_MSG}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    script_code = data['script_code']
    login_email = data['login_email']
    try:
        print("script code",script_code)
        submission = base_station.save_submission(script_code, login_email)
        print("submissions",submission)
        submission_id = submission.id
    except Exception as exception:
        print(exception)
    base_station.send_bot_script(bot_name, script_code)
    return json.dumps(True), status.HTTP_200_OK

@index_bp.route('/compile-virtual-program', methods=['POST'])
def compile_virtual_program():
    """ Compile a Python script so that it can be use to run virtual minibots """
    data = request.get_json()
    data_to_send = base_station.get_virtual_program_execution_data(data)
    return json.dumps(data_to_send), status.HTTP_200_OK


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
    pb_map = data['pb_map']
    base_station.set_bot_mode(bot_name, mode, pb_map)
    return json.dumps(True), status.HTTP_200_OK

@index_bp.route('/start_physical_blockly', methods=['POST'])
def start_physical_blockly():
    data = request.get_json()
    bot_name = data['bot_name']
    rfid = base_station.get_rfid(bot_name)
    print("passing through pb bot route")
    return json.dumps(rfid), status.HTTP_200_OK

@index_bp.route('/end_physical_blockly', methods=['GET'])
def end_physical_blockly():
    base_station.end_physical_blockly()
    return json.dumps(True), status.HTTP_200_OK

@index_bp.route('/vision', methods=['POST', 'GET'])
def vision():
    """Updates vision status"""
    # TODO add FPS tracking on server side
    if request.method == 'POST':
        info = request.get_json()
        base_station.update_vision_snapshot(info)
        return json.dumps(True), status.HTTP_200_OK
    else:
        info = request.args.to_dict()
        return json.dumps(base_station.get_vision_data(info)), status.HTTP_200_OK

@index_bp.route('/object-mapping', methods=['POST', 'GET'])
def object_mapping():
    """Updates vision object mapping"""
    if request.method == 'POST':
        info = request.get_json()
        base_station.update_vision_object_map(info)
        return json.dumps(True), status.HTTP_200_OK
    else:
        return json.dumps(base_station.get_vision_object_map()), status.HTTP_200_OK

@index_bp.route('/virtual-objects', methods=['POST', 'GET'])
def virtual_objects():
    """Updates vision virtual objects"""
    if request.method == 'POST':
        info = request.get_json()
        base_station.update_virtual_objects(info)
        return json.dumps(True), status.HTTP_200_OK
    else:
        return json.dumps(base_station.get_virtual_objects()), status.HTTP_200_OK

@index_bp.route('/delete_virtual_room', methods=['POST', 'GET'])
def delete_virtual_room():
    """Deletes a virtual enviroment given a virtual_room_id"""
    if request.method == 'POST':
        info = request.get_json()
        print(info)
        if info and info["virtual_room_id"]:
            base_station.delete_virtual_room(info["virtual_room_id"])
            return json.dumps(True), status.HTTP_200_OK
        else:
            error_json = {"error_msg": "/delete_virtual_room was not given a virtual_room_id field"}
            return json.dumps(error_json), status.HTTP_400_BAD_REQUEST
    else:
        error_json = {"error_msg": "/delete_virtual_room only accepts post requests"}
        return json.dumps(error_json), status.HTTP_400_BAD_REQUEST




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
    else:
        # invariant: submission_id is not None inside this block
        base_station.update_result(script_exec_result, submission_id)
        code = 1 if script_exec_result == "Successful execution" else 0
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

@index_bp.route('/get_custom_function/', methods=['GET'])
def get_custom_function():
    """Gets the logged in user's custom functions"""
    result = base_station.get_custom_function()
    
    if result[0]:
        return json.dumps(result[1]), status.HTTP_200_OK
    else:
        return json.dumps({'error': 'Not logged in'}), status.HTTP_401_UNAUTHORIZED

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


@index_bp.route('/user', methods=['GET'])
def get_user():
    email = request.args.get('email')
    user = base_station.get_user(email)
    if user is not None:
        return json.dumps(user.serialize()), status.HTTP_200_OK
    else:
        return json.dumps("User doesn't exist"), 400


@index_bp.route('/submission', methods=['POST'])
def create_submission():
    submission = base_station.create_submission()
    if submission is not None:
        return json.dumps(submission.serialize()), status.HTTP_200_OK
    else:
        return json.dumps("Submission failed"), 400


@index_bp.route('/analytics', methods=['GET'])
def analytics():
    email = request.args.get('email')
    user = base_station.get_user(email)

    if user is not None:
        submissions = base_station.get_all_submissions(user)

        successful_executions_per_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        errors_per_month = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        programs_this_month = 0
        programs_this_week = 0
        errors_this_month = 0
        errors_this_week = 0

        for submission in submissions:
            month = datetime.datetime.strptime(
                submission.time, "%Y/%b/%d %H:%M:%S").month
            year = datetime.datetime.strptime(
                submission.time, "%Y/%b/%d %H:%M:%S").year
            week = datetime.datetime.strptime(
                submission.time, "%Y/%b/%d %H:%M:%S").isocalendar()[1]

            if year == time.localtime().tm_year:
                if submission.result != "Successful execution":
                    errors_per_month[month-1] += 1
                else:
                    successful_executions_per_month[month-1] += 1

                if month == time.localtime().tm_mon:
                    programs_this_month += 1
                    print(programs_this_month)
                    if submission.result != "Successful execution":
                        errors_this_month += 1

                    if week == datetime.date.today().isocalendar()[1]:
                        programs_this_week += 1
                        if submission.result != "Successful execution":
                            errors_this_week += 1
        statistics = [
            successful_executions_per_month, errors_per_month, programs_this_month, programs_this_week, errors_this_month, errors_this_week]

        return json.dumps(statistics), status.HTTP_200_OK

    else:
        return json.dumps("Failed, not logged in"), 400


# To stop refreshing pages from 404 requests, temp solution to render page on refresh
@index_bp.route('/coding', methods=['GET'])
def coding():
    return render_template('index.html')

@index_bp.route('/user-analytics', methods=['GET'])
def user_analytics():
    return render_template('index.html')

@index_bp.route('/history', methods=['GET'])
def history():
    return render_template('index.html')

@index_bp.route('/context-history', methods=['GET'])
def context_history():
    return render_template('index.html')

@index_bp.route('/vision-page', methods=['GET'])
def vision_page():
    return render_template('index.html')
