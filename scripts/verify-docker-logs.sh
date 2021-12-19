$(docker logs peer_1 | grep -Fq "CONSENSUS ACHIEVED" &&
  docker logs peer_2 | grep -Fq "CONSENSUS ACHIEVED" &&
  docker logs peer_3 | grep -Fq "CONSENSUS ACHIEVED" &&
  docker logs peer_4 | grep -Fq "CONSENSUS ACHIEVED")
