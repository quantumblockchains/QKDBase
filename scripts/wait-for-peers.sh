#!/bin/bash

while 
  [ $(docker logs peer_1 | grep -c "Adding new node") != 3 ] ||
  [ $(docker logs peer_2 | grep -c "Adding new node") != 2 ] ||
  [ $(docker logs peer_3 | grep -c "Adding new node") != 1 ];
do
  sleep 1
  echo "Waiting for peers to connect..."
done
