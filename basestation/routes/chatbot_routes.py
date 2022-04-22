from flask import Flask
from flask import Blueprint, request, render_template, session, redirect
from flask_api import status
import os.path
import json
import sys
import time

# Minibot imports.
from .basestation_init import base_station
from flask import current_app

# Error messages
NO_BOT_ERROR_MSG = "Please connect to a Minibot!"

chatbot_bp = Blueprint('chatbot',
                     __name__,
                     url_prefix='/')

@chatbot_bp.route('/chatbot-context', methods=['POST', 'GET'])
def chatbot_context():
    if request.method == 'POST':
        print("route to chatbot context")
        data = request.get_json()
        command = data['command']
        if command == 'update':
            context = data['context']
            base_station.update_chatbot_context(context)
            return json.dumps(True), status.HTTP_200_OK
        
        elif command == "replace-context-stack":
            context_stack = data['contextStack']
            print(context_stack)
            base_station.replace_context_stack(context_stack)
            return json.dumps(True), status.HTTP_200_OK
        
        elif command == 'clear':
            base_station.chatbot_clear_context()
            return json.dumps(True), status.HTTP_200_OK
        
        elif command == 'get-all-local-context':
            context = base_station.get_chatbot_obj_context()
            return json.dumps({"context": context}), status.HTTP_200_OK
       
        elif command == 'commit-to-db':
            returned = base_station.update_chatbot_context_db()
            if returned == 1:
                return json.dumps(True), status.HTTP_200_OK
            elif returned == -1:
                return json.dumps({'error': 'Not logged in'}), status.HTTP_401_UNAUTHORIZED
        
        elif command == 'get-all-db-context':
            # TODO properly deal with guest users?
            user = base_station.login_email
            if user != "":
                answer = base_station.chatbot_get_context()
                return json.dumps(answer), status.HTTP_200_OK
            else:
                return json.dumps({'error': 'Not logged in'}), status.HTTP_401_UNAUTHORIZED
        
        elif command == "delete-context-by-id":
            idx = data['idx']
            res = base_station.chatbot_delete_context_idx(idx)
            return json.dumps({"res": res}), status.HTTP_200_OK
        
        elif command == "edit-context-by-id":
            idx = data['idx']
            context = data['context']
            res = base_station.chatbot_edit_context_idx(idx, context)
            return json.dumps({"res": res}), status.HTTP_200_OK
            


@chatbot_bp.route('/chatbot-ask', methods=['POST', 'GET'])
def chatbot_ask():
    if request.method == 'POST':
        data = request.get_json()
        question = data['question']
        answer = base_station.chatbot_compute_answer(question)
        return json.dumps(answer), status.HTTP_200_OK