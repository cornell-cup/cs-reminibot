from subprocess import Popen, PIPE, STDOUT
import time
# p = Popen(['./locate_tags.x', 'www.google.com', '0.calib'], stdout=PIPE, stdin=PIPE, stderr=PIPE)
p = Popen(['./locate_tags.x', 'www.google.com', '0.calib'], stdout=PIPE, stdin=PIPE, stderr=PIPE, universal_newlines=True)  # interpret as a string
# out = []
# for x in range(100):
# 	out.append("hey")
# time.sleep(10)
# while(True):
# p.communicate(b('\n'.join(out)))
locationstring = p.stdin.write("w")
p.stdin.flush()
locationstring = p.stdout.readline()
print(locationstring)

locationstring = p.stdin.write("w")
p.stdin.flush()
locationstring = p.stdout.readline()
print(locationstring)
p.terminate()
