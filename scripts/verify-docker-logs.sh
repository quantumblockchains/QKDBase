#!/bin/bash

while 
  [ $(docker logs peer_1 | grep -c "CONSENSUS ACHIEVED") != 1 ] ||
  [ $(docker logs peer_2 | grep -c "CONSENSUS ACHIEVED") != 1 ] ||
  [ $(docker logs peer_3 | grep -c "CONSENSUS ACHIEVED") != 1 ] ||
  [ $(docker logs peer_3 | grep -c "CONSENSUS ACHIEVED") != 1 ];
do
  sleep 1
  echo "Waiting for consensu to be achieved..."
done
