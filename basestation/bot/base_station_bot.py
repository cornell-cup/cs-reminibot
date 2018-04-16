"""
Object which represents the Pi bot (physical minibot).
Extends Bot class.
"""

class BaseStationBot(object):
    def __init__(self, bot_id):
        self.id = bot_id
       
    def get_id(self):
    	return self.id


