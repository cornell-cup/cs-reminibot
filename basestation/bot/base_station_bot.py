"""
Object which represents the Pi bot (physical minibot).
Extends Bot class.
"""

class BaseStationBot(object):
    def __init__(self, bot_id, bot_name, isPrivate):
        self.id = bot_id
        self.name = bot_name
        self.is_private = isPrivate
       
    def get_id(self):
    	return self.id

    def get_name(self):
    	return self.name

    def get_is_private(self):
        return self.is_private

    def set_is_private(self, bool):
        self.is_private = bool

