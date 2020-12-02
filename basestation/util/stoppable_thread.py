from collections import deque
from threading import Lock, Thread
from typing import Callable, List


class ThreadSafeVariable:
    """ Represents a thread safe variable.  All accesses
    are protected by a lock using the Python "with" statement
    """

    def __init__(self):
        self.lock = Lock()
        self.val = None

    def get_val(self) -> object:
        """ Return the variable's value """
        with self.lock:
            return self.val

    def set_val(self, value: object):
        """ Sets the variable's value """
        with self.lock:
            self.val = value

class ThreadSafeQueue:
    """ Represents a thread safe queue.  All accesses
    are protected by a lock using the Python "with" statement
    """

    def __init__(self):
        self.lock = Lock()
        self.queue = deque()

    def pop(self) -> object:
        """ Pop the oldest object from the from the front of the queue """
        with self.lock:
            return self.queue.popleft() if len(self.queue) > 0 else None

    def push(self, value: object):
        """ Push the newest object to the end of the queue"""
        with self.lock:
            self.queue.append(value)



class StoppableThread:
    """ Represents a thread that can be stopped using the
    ThreadSafeVariable as a boolean.  A function that is wrapped
    by this class must take in the ThreadSafeVariable boolean
    as a parameter which stops its main while loop.  The function must also 
    take in a ThreadSafeQueue which can be used a for sending
    messages between the parent function and this thread.  

    Example Usage:
        Let's say we want to spawn a thread that prints two random message.  

        Create the Stoppable Thread as follows:
            stoppable_thread = StoppableThread(
                print_function, random_message_1, random_message_2
            )
        
        Define the print_function as follows (all functions that are spawned
        by the StoppableThread class must take thread_safe_condition and 
        thread_safe_message as parameters):
            def print_function(
                thread_safe_condition, 
                thread_safe_message, 
                random_message_1,
                random_message_2
            ):
                while thread_safe_condition.get_val():
                    print(random_message_1, random_message_2)
    """

    def __init__(self, target_function: Callable, *args: List[object]):
        """ Creates a StoppableThread.
        
        Arguments:
            target_function:  The function that will be spawned in the new thread
            args:  The arguments that must be passed to the  target_function 
        """
        self.condition = ThreadSafeVariable()
        self.message_queue = ThreadSafeQueue()
        self.func = target_function
        self.func_args = list(args)
        self.is_running = False

    def start(self):
        """ Starts the StoppableThread """
        # don't start thread if thread is already running
        if self.is_running:
            return
        self.condition.set_val(True)
        # start the function and pass in the thread safe condition
        # and thread safe message queue as arguments
        args=[self.condition, self.message_queue] + self.func_args
        Thread(target=self.func, args=args, daemon=True).start()
        self.is_running = True

    def stop(self):
        """ Stops the StoppableThread """
        self.condition.set_val(False)
        self.is_running = False