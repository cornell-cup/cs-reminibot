"""
Main file from which BaseStation Websocket interface begins.
"""

from flask import Flask, request, render_template, jsonify, session, redirect
from flask_api import status
import os.path
import json
import sys
import time

# Minibot imports.
from basestation.flask_db import db, Program, User
from basestation.base_station import BaseStation
from basestation import app
import basestation.flask_db as blockly_app

base_station = BaseStation(app.debug)

@app.route('/start', methods=['GET'])
def start():
    """ Display the WebGUI """
    return render_template('index.html')


@app.route('/discover-bots', methods=['GET'])
def discover_bots():
    """ Get all Minibots connected to the Basestation """
    base_station.listen_for_minibot_broadcast()
    return json.dumps(True)


@app.route('/active-bots', methods=['GET'])
def active_bots():
    """ Get all Minibots connected to the Basestation """
    return json.dumps(base_station.get_active_bots())

@app.route('/wheels', methods=['POST'])
def wheels():
    """ Makes the Minibot move. """
    data = request.get_json()
    bot_name = data['bot_name']
    direction = data['direction']
    power = data['power']
    base_station.move_bot_wheels(bot_name, direction, power)
    return json.dumps(True)


@app.route('/script', methods=['POST'])
def script():
    """ Make Minibot run a Python script """
    data = request.get_json()
    bot_name = data['bot_name']
    script_code = data['script_code']
    base_station.send_bot_script(bot_name, script_code)
    return json.dumps(True)


@app.route('/ports', methods=['POST'])
def ports():
    """ Configures which sensors and motors are connected to which ports on the 
    Minibot's PCB (Printed Circuit Board)
    """
    data = request.get_json()
    bot_name = data['bot_name']
    ports = data['ports']
    base_station.set_bot_ports(bot_name, ports)
    return json.dumps(True)


@app.route('/vision', methods=['GET'])
def vision_get():
    return json.dumps(base_station.get_vision_data())


@app.route('/vision', methods=['POST'])
def vision_post():
    info = request.get_json()
    base_station.update_vision_log(info)
    return json.dumps(True)


@app.route('/result', methods=['POST'])
def error_message_update():
    data = request.get_json()
    bot_name = data['bot_name']
    script_exec_result = base_station.get_bot_script_exec_result(bot_name)
    if not script_exec_result:                         
        code = -1
    elif script_exec_result == "Successful execution": 
        code = 1
    else:                                              
        code = 0
    return json.dumps({"result": script_exec_result, "code": code})

@ app.route("/program")
def get_program():
    programs = Program.query.all()
    for program in programs:
        print(program.serialize())
    return json.dumps({'data': [program.serialize() for program in programs]})


@ app.route("/code", methods=['POST'])
def post_code():
    print("can you see me")
    global login_email
    print("login_in email: " + login_email)
    data = request.get_json()
    t = time.localtime()
    current_time = time.strftime("%H:%M:%S", t)
    print(data)
    print(current_time)
    print(login_email)
    program = Program(
        code=data.get('value'),
        time=current_time,
        email=login_email,
        duration=data.get('duration')
    )
    db.session.add(program)
    db.session.commit()
    return json.dumps(data)


@app.route('/register/', methods=['POST'])
def register_account():
    email = request.form['email']
    password = request.form['password']

    if not email:
        return json.dumps({'error': 'Invalid email'}), 404
    if not password:
        return json.dumps({'error': 'Invalid password'}), 404

    created, user = blockly_app.create_user(email, password)

    if not created:
        return json.dumps({'error': 'User already exists'}), 404

    print("session_token: " + user.session_token)
    print("session_expiration" + str(user.session_expiration))
    print("update_token" + user.update_token)
    print("user_id" + str(user.id))

    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token,
        'user_id': user.id,
        'email': email
    })


@app.route('/login/', methods=['POST'])
def login():
    global login_email
    email = request.form['email']
    password = request.form['password']

    if not email:
        return json.dumps({'error': 'Invalid email'}), 404

    if not password:
        return json.dumps({'error': 'Invalid password'}), 404

    success, user = blockly_app.verify_credentials(email, password)

    if not success:
        return json.dumps({'error': 'Incorrect email or password'}), 404

    print("success" + email)
    login_email = email
    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token,
        'user_id': user.id,
        'email': email,
        'custom_function': user.custom_function
    })


@app.route('/logout/', methods=['POST'])
def logout():
    global login_email
    if login_email == "":
        print("login email empty")
        content = {'error': 'no user to logout'}
        return content, status.HTTP_400_BAD_REQUEST

    content = {'success': 'user '+login_email+' was logged out.'}
    login_email = ""
    return content, status.HTTP_200_OK


@app.route('/session/', methods=['POST'])
def update_session():
    success, update_token = blockly_app.extract_token(request)

    if not success:
        return update_token

    try:
        user = blockly_app.renew_session(update_token)
    except:
        return json.dumps({'error': 'Invalid update token'})

    return json.dumps({
        'session_token': user.session_token,
        'session_expiration': str(user.session_expiration),
        'update_token': user.update_token
    })


@app.route('/custom_function/', methods=['POST'])
def update_custom_function():
    session_token = request.form['session_token']
    custom_function = request.form['custom_function']

    if not session_token or not custom_function:
        print("error: Missing session_token or custom_function")
        return json.dumps({'error': 'Missing session_token or custom_function'}), 404

    success, res = blockly_app.update_custom_function_by_session_token(
        session_token, custom_function)

    if not success:
        return json.dumps({'error': 'invalid session_token'}), 404
    return json.dumps({'custom_function': custom_function}), 201