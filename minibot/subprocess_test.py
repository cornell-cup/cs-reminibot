import subprocess
from subprocess import Popen
import time

spawn = subprocess.Popen(
    args=["python3", "test_program.py"], stdout=subprocess.PIPE, universal_newlines=True
)
print("preparing to read")
while True:
    output = spawn.stdout.readline()
    spawn.stdout.flush()
    time.sleep(1)
    print(output)
