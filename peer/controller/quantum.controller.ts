import express from 'express';
import { log } from '../../shared/utils/log';
import { Services } from '../services/services';

export const getQuantumRoutes = (services: Services) => {
  const router = express.Router();
  const jsonParser = express.json();

  const { oneTimePadService, toeplitzService } = services;

  router.post('/check-toeplitz', jsonParser, (req, res) => {
    log('Received check Toepltiz matrix request');
    const { nodeAddress } = req.body;
    const toeplitzMatrix = toeplitzService.checkIfToeplitzAsStringExists(nodeAddress);
    log('Sending found Toeplitz matrix');
    res.send({ toeplitzMatrix });
  });

  router.post('/check-one-time-pad', jsonParser, (req, res) => {
    log('Received check one time pad request');
    const { nodeAddress } = req.body;
    const oneTimePad = oneTimePadService.checkIfOneTimePadExists(nodeAddress);
    log('Sending found one time pad');
    res.send({ oneTimePad });
  });

  router.post('/receive-toeplitz', jsonParser, async (req, res) => {
    log('Received request to store established Toeplitz matrix');
    try {
      const { toeplitzMatrix, nodeAddress } = req.body;
      toeplitzService.addToeplitzMatrix(toeplitzMatrix, nodeAddress);
    } catch (error) {
      console.error(error);
    }
    res.send('Toeplitz string added');
  });

  router.post('/receive-one-time-pad', jsonParser, async (req, res) => {
    log('Received request to store established one time pad');
    try {
      const { oneTimePad, nodeAddress } = req.body;
      oneTimePadService.addOneTimePad(oneTimePad, nodeAddress);
    } catch (error) {
      console.error(error);
    }
    res.send('One-time pad added');
  });

  router.get('/show-toeplitz', (req, res) => {
    res.send(toeplitzService.getToeplitzMapping());
  });

  router.get('/show-one-time-pad', (req, res) => {
    res.send(oneTimePadService.getOneTimePadMapping());
  });

  return router;
};
