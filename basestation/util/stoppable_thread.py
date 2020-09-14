from threading import Lock, Thread


class ThreadSafeCondition:
    """ Represents a thread safe boolean variable.  All accesses
    are protected by a lock using the Python "with" statement
    """

    def __init__(self):
        self.lock = Lock()
        self.val = False

    def read_val(self):
        with self.lock:
            return self.val

    def set_val(self, value):
        with self.lock:
            self.val = value


class StoppableThread:
    """ Represents a thread that can be stopped using the
    Thread safe condition variable.  A function that is wrapped
    by this class must take in the thread safe condition variable
    as a parameter which stops its main while loop.
    """

    def __init__(self, target_function):
        self.func = target_function
        self.condition = ThreadSafeCondition()
        self.is_running = False

    def start(self):
        # don't start thread if thread is already running
        if self.is_running:
            return
        self.condition.set_val(True)
        # start the function and pass in the thread safe condition
        # variable as an argument
        Thread(target=self.func, args=[self.condition]).start()
        self.is_running = True

    def stop(self):
        self.condition.set_val(False)
        self.is_running = False


def server(thread_safe_condition):
    """ Example function """
    while thread_safe_condition.read():
        print("do server code")
    print("Server has been stopped!!!!")


""" Example main code """
if __name__ == "__main__":
    st = StoppableThread(server)
    while True:
        string = input()
        if string == "start":
            st.start()
        elif string == "stop":
            st.stop()
