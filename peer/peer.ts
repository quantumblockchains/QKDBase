import express from 'express';
import { getNormalRoutes } from './controller/normal.controller';
import { getQuantumRoutes } from './controller/quantum.controller';
import { services } from './services/services';
import { log } from './utils/log';

const normalConnection = express();
const quantumConnection = express();
const normalConnectionPort = 3016;
const quantumConnectionPort = 3017;

normalConnection.use(getNormalRoutes(services))
quantumConnection.use(getQuantumRoutes(services))

normalConnection.listen(normalConnectionPort, () => {
  log('Peer normal connection listening');
});

quantumConnection.listen(quantumConnectionPort, () => {
  log('Peer quantum connection listening');
});
