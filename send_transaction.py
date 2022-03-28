import requests

headers = {
  'Content-Type': 'application/json',
}

data = '{"transaction":"Litwo, Ojczyzno moja! ty jestes jak zdrowie"}'

requests.post('http://localhost:3015/send-transaction', headers=headers, data=data)
