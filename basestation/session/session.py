"""
Class which represents the GUI session
run by the user.
"""
import datetime
import time 

class Session:
    def __init__(self, session_id):
        self.session_id = session_id
        self.bots = set([])
        self.bots_time_connected = {}
        self.playground = None

        created = datetime.datetime.now()
        self.time_created = created

    def get_session_id(self):
        return self.session_id

    def add_bot_id_to_session(self, bot_id):
        self.bots.add(bot_id)
        self.bots_time_connected[bot_id] = datetime.datetime.now()
        return True

    def remove_bot_id_from_session(self, bot_id):
        self.bots.remove(bot_id)
        del self.bots_time_connected[bot_id]

    def has_bot(self, bot_id):
        return bot_id in self.bots

    def get_session_bots(self):
        return self.bots

    def get_playground(self):
        return self.playground

    def get_time_connected_to_bot_id(self, bot_id):
        return self.bots_time_connected[bot_id].strftime("%I:%M:%S")
        
    def get_time_created(self):
        return self.time_created.strftime("%I:%M:%S")
