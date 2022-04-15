# Quantum Blockchain

Quantum Blockchain is MVP based on the whitepaper: https://www.mdpi.com/1099-4300/21/9/887.
The Repository consists of two parts. The first one is implementation of the consensus with specific assumptions. It is based on 4 peers and 1 client which sends transactions to peers. Both client and peers are closed in docker containers and communicate with each other using REST requests. Each peer has 2 ports open for communication simulating normal channel and quantum channel. The second part is visualisation of how consensus works. It is based on simple JS, CSS and HTML.

#### Required software:

  * python3
  * curl
  * yarn
  * docker
  * docker-compose
  * Tilix (Linux) or iTerm (Mac OS)


#### To install dependencies (in main directory):

```sh
  yarn
```

#### To start peers and client in docker container (in scripts directory):

```sh
  python3 start_docker.py
```

#### To make client send transaction to peers (in scripts directory):

```sh
  python3 send_transaction.py
```

#### To stop client and peers (in scripts directory):

```sh
  python3 stop_docker.py
```

**Important! In order to preserve block persistence use python scripts to start and stop client and peers**


#### To open peers logging terminals on Linux (in main directory):

```sh
  tilix --session tilix.json
```

#### To open peers logging terminals on Mac OS (in main directory):

```sh
  itermocil
```
for more info see https://github.com/quantumblockchains/QuantumBlockchains 
