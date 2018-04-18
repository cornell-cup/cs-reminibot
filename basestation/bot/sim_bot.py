"""
Object to represent Simulated Minibot.
Extends Bot class.
"""

from bot.base_station_bot import BaseStationBot

class SimBot(BaseStationBot):
    def __init__(self, bot_id, bot_name):
        super(SimBot, self).__init__(bot_id, bot_name)