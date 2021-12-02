import requests

headers = {
  'Content-Type': 'application/json',
}

data = '{"transaction":"123+rebel_ i*on#yjhk"}'

response = requests.post('http://0.0.0.0:3015/send-transaction', headers=headers, data=data)
