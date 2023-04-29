from flask import Flask
from flask import Blueprint, request, render_template, session, redirect, flash
from flask_api import status
import os.path
import json
import sys
import time
from flask import Flask, request, jsonify
import os
import openai
from dotenv import load_dotenv

# Minibot imports.
from .basestation_init import base_station
from flask import current_app

# Error messages
NO_BOT_ERROR_MSG = "Please connect to a bot!"

chatbot_bp = Blueprint('chatbot',
                       __name__,
                       url_prefix='/')


@chatbot_bp.route('/chatbot-context', methods=['POST', 'GET'])
def chatbot_context():
    if request.method == 'POST':
        data = request.get_json()
        command = data['command']
        if command == 'update':
            context = data['context']
            base_station.update_chatbot_context(context)
            return json.dumps(True), status.HTTP_200_OK

        elif command == "replace-context-stack":
            context_stack = data['contextStack']
            base_station.replace_context_stack(context_stack)
            return json.dumps(True), status.HTTP_200_OK

        elif command == 'reset-context-stack':
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
                return json.dumps({'error': 'Not logged in or context stack has not been loaded'}), status.HTTP_401_UNAUTHORIZED

        elif command == 'get-all-db-context':
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


app = Flask(__name__)

load_dotenv()
openai.api_key = os.environ.get('API_KEY')


@chatbot_bp.route('/chatbot-ask', methods=['POST', 'GET'])
def chatbot_ask():
    if request.method == 'POST':
        data = request.get_json()
        question = data['question']
        if question.lower().startswith("gpt:") or question.lower().startswith("chatgpt:"):
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": question}]
            )
            answer = response["choices"][0]["message"]["content"]
        else:
            answer = base_station.chatbot_compute_answer(question)
        return json.dumps(answer), status.HTTP_200_OK


@chatbot_bp.route('/chatbot-upload', methods=['POST', 'GET'])
def chatbot_upload():
    if request.method == 'POST':
        content_header = request.headers['Upload-Content']
        if content_header == 'filenames':
            data = request.get_json()
            filename = data['filename']
            base_station.update_chatbot_context(
                "I have uploaded files: " + filename)
            return json.dumps(True), status.HTTP_200_OK
        else:
            # uploaded = request.form.to_dict()
            # print(list(uploaded.values()), file=sys.stderr)

            data = request.get_json()
            filename = data['script_name']
            fileData = data['script_code']
            userEmail = data['login_email']
            base_station.chatbot_upload_file(fileData, filename, userEmail)
            return json.dumps(True), status.HTTP_200_OK
    else:
        filename_header = request.headers['File-Name']
        user_header = request.headers['User-Email']
        return base_station.chatbot_get_upload(filename_header, user_header)
