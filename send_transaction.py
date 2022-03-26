import requests

headers = {
  'Content-Type': 'application/json',
}

data = '{"transaction":"Litwo, Ojczyzno moja! ty jestes jak zdrowie; Ile cie trzeba cenic, ten tylko sie dowie, Kto cie stracil. Dzis pieknosc twa w calej ozdobie Widze i opisuje, bo tesknie po tobie.Litwo, Ojczyzno moja! ty jestes jak zdrowie; Ile cie trzeba cenic, ten tylko sie dowie, Kto cie stracil. Dzis pieknosc twa w calej ozdobie Widze i opisuje, bo tesknie po tobie."}'

requests.post('http://localhost:3015/send-transaction', headers=headers, data=data)
