import express from 'express';
import { buildNormalRoutes } from './controller/normal.controller';
import { getQuantumRoutes } from './controller/quantum.controller';
import { services } from './services/services';
import { log } from './utils/log';

export const buildPeer = (onSuccess: () => void, onError: () => void) => {
  try {
    const normalConnection = express();
    const quantumConnection = express();
    const normalConnectionPort = 3016;
    const quantumConnectionPort = 3017;
    
    normalConnection.use(buildNormalRoutes(services, onSuccess, onError));
    quantumConnection.use(getQuantumRoutes(services));
    
    normalConnection.listen(normalConnectionPort, () => {
      log('Peer normal connection listening');
    });
    
    quantumConnection.listen(quantumConnectionPort, () => {
      log('Peer quantum connection listening');
    });
  } catch (error) {
    console.error(error);
  }
};
