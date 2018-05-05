"""
Class which represents the GUI session
run by the user.
"""

class Session:
    def __init__(self, session_id):
        self.session_id = session_id
        self.bots = set([])
        self.playground = None

    def get_session_id(self):
        return self.session_id

    def add_bot_id_to_session(self, bot_id):
        self.bots.add(bot_id)
        return True

    def remove_bot_id_from_session(self, bot_id):
        self.bots.remove(bot_id)

    def has_bot(self, bot_id):
        return bot_id in self.bots

    def get_session_bots(self):
        return self.bots

    def get_playground(self):
        return self.playground
