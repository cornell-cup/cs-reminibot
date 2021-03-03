from ctypes import c_char_p
from multiprocessing import Process, Manager, Value
import os
import importlib
import sys


class BlocklyPythonProcess:
    """ Stores the process which is executing the Blockly / Python script
    being executed by the user. """
    def __init__(self, BOT_LIB_FUNCS):
        # the currently executing process, None if nothing executing
        self.proc = None 
        # the result of the last executed process
        self.result = None 
        self.BOT_LIB_FUNCS = BOT_LIB_FUNCS
    
    def get_exec_result(self) -> str:
        """ Gets the execution result of the last blockly / python script """
        return self.result.value if self.result else ""
    
    def is_running(self) -> bool:
        """ Whether there is a currently executing blockly / python script """
        return self.proc is not None

    def kill_proc(self):
        # send kill signal to process
        self.proc.terminate()
        # wait for the process to terminate completely
        self.proc.join()
        self.proc = None
        self.result.value = "Killed by user"
    
    def spawn_script(self, code: str):
        """ Starts the specified script in a new process so that the main
        minibot.py thread is not blocked.  For example, the user may want to 
        execute:
            while True:
                print("hi")
        and would not want the Minibot to become unresponsive.  Hence these 
        scripts must be spawned in new processes
    
        Arguments:
            code:  The code of the script that will be spawned
        """
        script_name = "bot_script.py"
        program = self.process_string(code)

        # write the script to a file which we'll execute
        # file_dir is the path to folder this file is in
        file_dir = os.path.dirname(os.path.realpath(__file__))
        script_file = open(file_dir + "/scripts/" + script_name, 'w+')
        script_file.write(program)
        script_file.close()

        # create a shared variable of type "string" between the child
        # process and the current process
        manager = Manager()
        self.result = manager.Value(c_char_p, "")

        if self.proc and self.proc.is_alive():
            self.kill_proc()
            self.result.value = (
                "Another process is running....Killing the process now....." +
                "Press Run again"
            )
            return

        # Run the Python program in a different process so that we
        # don't need to wait for it to terminate and we can kill it
        # whenever we want.
        self.proc = Process(
            target=self.run_script,
            args=[script_name]
        )
        self.proc.daemon = True
        self.proc.start()

    def process_string(self, value: str) -> str:
        """
        Function from /minibot/main.py. Encases programs in a function
        called run(), which can later be ran when imported via the
        import library. Also adds imports necessary to run bot functions.
        Args:
            value (:obj:`str`): The program to format.
        """
        cmds = value.splitlines()
        program = "from scripts." + self.BOT_LIB_FUNCS + " import *\n"
        program += "import time\n"
        program += "from threading import *\n"
        program += "def run():\n"
        for i in range(len(cmds)):
            cmds[i] = cmds[i].replace(u'\xa0', u' ')
            program += "    " + cmds[i] + "\n"
        return program
    
    def run_script(self, scriptname: str):
        """
        Loads a script and runs it.
        Args:
            scriptname: The name of the script to run.
        """
        # Cache invalidation and module refreshes are needed to ensure
        # the most recent script is executed
        try:
            index = scriptname.find(".")
            importlib.invalidate_caches()
            script_name = "scripts." + scriptname[0: index]
            script = importlib.import_module(script_name)
            importlib.reload(script)
            script.run()
            self.result.value = "Successful execution"
        except Exception as exception:
            str_exception = str(type(exception)) + ": " + str(exception)
            self.result.value = str_exception