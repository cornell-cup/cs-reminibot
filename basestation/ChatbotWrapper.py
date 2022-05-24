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


class ChatbotWrapper:

    def __init__(self, context=default_context):
        self.context_stack = []  # context

    def replace_context_stack(self, context_stack):
        '''Replaces the self.context_stack with <context_stack>.
        '''
        self.context_stack = context_stack
        # print("ChatbotWrapper", context_stack)

    def update_context(self, context):
        '''Appends context to <self.context_stack>. If the context does not
        end with a period, adds a period to the end of the context and appends
        it to <self.context_stack>.
        '''
        if context != "":
            if context[-1] == ".":
                self.context_stack.append(context)
            else:
                self.context_stack.append(context + ".")
            # print("context updated", self.context_stack)

    def get_latest_context(self):
        '''Returns the last entry on the context_stack.
        '''
        return self.context_stack[-1]

    def get_all_context(self):
        '''Returns all local context as a list.
        '''
        # print("get all local context", self.context_stack)
        return self.context_stack

    def reset_context(self):
        '''Replaces self.context_stack with the default context.
        '''
        self.context_stack = []
        # print("local context reset", self.context_stack)

    def undo_context(self):
        '''Removes the last item from self.context_stack.
        '''
        if len(self.context_stack) > 1:
            self.context_stack.pop()
            return SUCCESS
        else:
            return FAILURE

    def delete_context_by_id(self, id):
        '''Replaces self.context_stack[id] with an empty string.
        '''
        if len(self.context_stack) > id:
            self.context_stack[id] = ""
            return SUCCESS
        else:
            return FAILURE

    def edit_context_by_id(self, id, context):
        '''Changes the <self.context_stack[<id>]> to <context>.
        '''
        if len(self.context_stack) > id:
            if not len(context):
                self.context_stack[id] = ""
            elif context[-1] == ".":
                self.context_stack[id] = context
            else:
                self.context_stack[id] = context + "."
            return SUCCESS
        else:
            return FAILURE

    def compute_answer(self, input_question):
        """ Sends question with context to our QA-server.
        Returns:
        <answer> - str 
        """
        url = "http://3.135.244.37:8000/qa"
        if ' '.join(self.context_stack) == "":
            return "Tell me something first!"
        else:
            data = {"question": input_question,
                    "context": ' '.join(self.context_stack)}
            resp = requests.get(url, json=data)
            return resp.text
