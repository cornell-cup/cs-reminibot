import threading

def synchronized(f):
    """
    Creates an internal lock for this function and synchronizes across all
    threads that can access this function. This method can be used with a
    decorator @synchronized above the definition of the function f.

    Args:
        f (func): Function to synchronize

    Returns:
        (func): A synchronized function

    Examples:
        `@synchronized
        def incr_cnt():
            global cnt
            cnt += 1`
    """
    f.__lock__ = threading.Lock()

    def synced_func(*args, **kwargs):
        with f.__lock__:
            return f(*args, **kwargs)

    return synced_func