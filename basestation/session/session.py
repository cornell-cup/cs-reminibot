"""
Class which represents the GUI session
run by the user.
"""

class Session:
    def __init__(self, session_id):
        self.session_id = session_id
        self.bots = {}
        self.playground = None

    def get_session_id(self):
        return self.session_id

    def add_bot_id_to_session(self, bot_id):
        self.bots.append(bot)
        return True

    def get_session_bots(self):
        return self.bots

    def get_playground(self):
        return self.playground
