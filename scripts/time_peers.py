import requests
import subprocess
from time import time, sleep

def parse_output(input: str):
    time_string = input.partition(' - ')[0]
    hours = int(time_string[:2])
    minutes = int((time_string[3:5]))
    seconds = int((time_string[6:8]))
    milisec = int(time_string[9:])
    return [hours, minutes, seconds, milisec]

def get_time(start: list, stop:list):
    res = stop[0] - start[0]
    res = res * 60 +  stop[1] - start[1]
    res = res * 60 +  stop[2] - start[2]
    res = res * 1000 + stop[3] - start[3]  
    return  res

headers = {
  'Content-Type': 'application/json',
}
add = 's' * 10
test_string = '123+rebel_ i*on#yjhk'  + add
data = '{"transaction":"' + test_string + '"}'

subprocess.call(['python3', 'start_docker.py'])
print('dockers started, wait for 1 s')
sleep(1)
response = requests.post('http://0.0.0.0:3015/send-transaction', headers=headers, data=data)
average_time = 0
try:
    for i in range(4):
        i = i + 1
        start = time()
        while True:
            peer_stop = subprocess.getoutput("docker logs peer_" + str(i) + " | grep  'CONSENSUS'")
            if (peer_stop != ''):
                peer_start = subprocess.getoutput("docker logs peer_" + str(i) + " | grep 'Received transaction'")
                average_time += get_time(parse_output(peer_start), parse_output(peer_stop))/4
                break
            if time() - start > 10:
                print('Out of time')
                break  
finally:    
    subprocess.call(['python3', 'stop_docker.py'])
print('String length: ' + str(len(test_string)) + '. Average time: ' + str(average_time) + 'ms.')
