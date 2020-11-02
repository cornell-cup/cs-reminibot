"""
Connection class for any communication between
a module and the Base Station.
"""

class BaseConnection:
    def __init__(self):
        self.tcp = {}

    def list_active_connections(self):
        return self.active_connections

    def get_active_connection(self, name):
        return self.active_connections[name]

