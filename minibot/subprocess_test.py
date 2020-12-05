import subprocess
from subprocess import Popen
import time

spawn = subprocess.Popen(
    args=["python3", "test_program.py"], stdout=subprocess.PIPE, universal_newlines=True
)
print("preparing to read")
output = spawn.stdout.readline()
print(output)
spawn.terminate()
