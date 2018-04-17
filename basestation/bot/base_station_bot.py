"""
Object which represents the Pi bot (physical minibot).
Extends Bot class.
"""

class BaseStationBot(object):
    def __init__(self, bot_id, bot_name):
        self.id = bot_id
        self.name = bot_name
       
    def get_id(self):
    	return self.id

    def get_name(self):
    	return self.name


