import requests

headers = {
  'Content-Type': 'application/json',
}

test_string = 'Litwo, Ojczyzno moja! ty jestes jak zdrowie'
data = '{"transaction":"' + test_string + '"}'

requests.post('http://localhost:3015/send-transaction', headers=headers, data=data)
