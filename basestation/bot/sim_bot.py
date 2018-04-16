"""
Object to represent Simulated Minibot.
Extends Bot class.
"""

from basestation.bot.bot import Bot

class SimBot(BaseStationBot):
    def __init__(self, bot_id):
        super(SimBot, self).__init__(bot_id)