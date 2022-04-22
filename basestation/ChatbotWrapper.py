import requests
import time
from requests.structures import CaseInsensitiveDict
import json

default_context = "Hello, I am minibot. My creators are from Cornell but I \
legally can't say that because they signed a waiver. Oh well, let's just say \
I was created at Harvard. I have two wheels that are connected to motors with \
two caster wheels. Tasks I can do are following lines and detecting objects. \
I can be programmed to move using Blockly or Python - or both! You can share more about \
yourself (including your search history) using the textbox in the chatbot feature. \
Make sure to SMASH the like button and hit \
subscribe and turn on the notification bell.  \
See you guys in the next episode. Join my Twitch, Patreon, and Instagram."

default_context = "The sky is blue."

SUCCESS = 200
FAILURE = 400

# TODO:
# 1. Replace context stack with new context stack


class ChatbotWrapper:

    def __init__(self, context=default_context):
        self.context_stack = [context]  # context

    def replace_context_stack(self, context_stack):
        self.context_stack = context_stack

    def update_context(self, context):
        if context != "":
            if context[-1] == ".":
                self.context_stack.append(context)
            else:
                self.context_stack.append(context + ".")

    def get_latest_context(self):
        return self.context_stack[-1]

    def get_all_context(self):
        '''Returns all local context as a list.'''
        return self.context_stack

    def reset_context(self):
        self.context_stack = [default_context]

    def undo_context(self):
        if len(self.context_stack) > 1:
            self.context_stack.pop()
            return SUCCESS
        else:
            return FAILURE

    def delete_context_by_id(self, id):
        print("delete")
        print(self.context_stack)
        print(id)
        if len(self.context_stack) > id:
            self.context_stack[id] = ""
            print(self.context_stack)
            return SUCCESS
        else:
            return FAILURE

    def edit_context_by_id(self, id, context):
        print("edit")
        print(self.context_stack)
        print(str(id) + " " + context)
        if len(self.context_stack) > id:
            if context[-1] == ".":
                self.context_stack[id] = context
            else:
                self.context_stack[id] = context + "."
            return SUCCESS
        else:
            return FAILURE

    def compute_answer(self, input_question):
        # self.context_stack = ['. '.join(self.context_stack)]
        url = "http://3.135.244.37:8000/qa"
        # TODO set this using startup parameters
        print("context: ", self.context_stack)
        if ' '.join(self.context_stack) == "":
            return "Tell me something first!"
        else:
            data = {"question": input_question,
                    "context": ' '.join(self.context_stack)}
            resp = requests.get(url, json=data)
            return resp.text
