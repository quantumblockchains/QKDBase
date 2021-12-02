import express from 'express';
import dotenv from 'dotenv';
import { buildNormalRoutes } from './controller/normal.controller';
import { getQuantumRoutes } from './controller/quantum.controller';
import { buildServices } from './services/services';
import { log } from '../shared/utils/log';
dotenv.config();

export const buildPeer = async (onSuccess: () => void, onError: () => void) => {
  try {
    validateEnvVariables();

    const services = buildServices();
    await services.nodeService.getNodesFromBootstrap();

    const normalConnection = express();
    const quantumConnection = express();
    const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
    const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;

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

const validateEnvVariables = () => {
  const nodeAddress = process.env.NODE_ADDRESS;
  const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
  const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;
  const bootstrapNodeAddress = process.env.BOOTSTRAP_NODE_ADDRESS;

  if (!(nodeAddress && normalConnectionPort && quantumConnectionPort && bootstrapNodeAddress)) {
    throw Error('Invalid environment variables');
  }
}
