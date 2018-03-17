"""
Class which represents the GUI session
run by the user.
"""

class Session:
    def __init__(self):
        self.port = None

    def run(self, port):
        self.port = port

if __name__=="__main__":
    sess = Session()
    sess.run(8080)