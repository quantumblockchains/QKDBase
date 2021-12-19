import requests

headers = {
  'Content-Type': 'application/json',
}

data = '{"transaction":"123+rebel_ i*on#yjhk"}'

requests.post('http://localhost:3015/send-transaction', headers=headers, data=data)
