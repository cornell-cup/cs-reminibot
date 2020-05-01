from subprocess import Popen, PIPE, STDOUT
p = Popen(['./get_key.py'], stdout=PIPE, stdin=PIPE, stderr=PIPE)
stdout_data = p.communicate(input=b'w')[0]
print(stdout_data)
