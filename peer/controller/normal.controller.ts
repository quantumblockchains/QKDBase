import express from 'express';
import { shuffleArray } from '../utils/shuffleArray';
import { wait } from '../utils/wait';
import { log } from '../../shared/utils/log';
import { Services } from '../services/services';
import { matrixMathService } from '../services/matrixMath.service';
import { DataProposalRequest } from '../types';
import { NodeAddresses } from '../../shared/types';

export const buildNormalRoutes = (services: Services, onSuccess: () => void, onError: () => void) => {
  const router = express.Router();
  const jsonParser = express.json();

  const { dataService, nodeService, oneTimePadService, toeplitzService, transactionService, votingService } = services;
  
  const clearEverything = () => {
    toeplitzService.clearToeplitzGroupSignature();
    toeplitzService.clearToeplitzMatrixesMapping();
    oneTimePadService.clearOneTimePads();
    transactionService.clearTransactionHash();
    dataService.clearDataProposal();
    votingService.clearVotes();
  };
  
  const establishNecessaryData = async (transaction: string) => {
    const transactionLength = matrixMathService().convertStringToBinary(transaction).length;
    await toeplitzService.establishToeplitzMatrix(transactionLength);
    await oneTimePadService.establishOneTimePad(transactionLength);
  };
  
  const generateHashedTransaction = (toeplitzHash: string) => {
    const dataProposal = dataService.getDataProposal();
    const calculatedTransactionHash = transactionService.calculateTransactionHash(dataProposal, toeplitzHash);
    transactionService.storeTransactionHash(calculatedTransactionHash);
    return calculatedTransactionHash;
  };
  
  const addProposalPeerToToeplitzGroupSignature = () => {
    const dataProposal = dataService.getDataProposal();
    const toeplitzHash = toeplitzService.generateToeplitzHash(dataProposal);
    const calculatedTransactionHash = generateHashedTransaction(toeplitzHash);
    toeplitzService.addToeplitzHashToGroupSignature(toeplitzHash);
    return calculatedTransactionHash;
  };
  
  const startVoting = (calculatedTransactionHash: string) => {
    log('Starting voting, create peer queue');
    const allNodesAddresses = nodeService.getAllNodesAddresses();
    const randomPeerArray = shuffleArray(allNodesAddresses);
    votingService.initializeVote(randomPeerArray, calculatedTransactionHash);
  };
  
  const waitForDataToPropagate = async () => {
    log('Waiting for data to propagate');
    await wait(() => toeplitzService.getToeplitzGroupSignature().length === 4, 500);
    await wait(() => !!dataService.getDataProposal(), 500);
  };
  
  
  router.post('/receive-transaction', jsonParser, async (req, res) => {
    log('Received transaction');
    const { address } = nodeService.getMyNodeAddresses();
    if (address !== 'http://peer_1') {
      res.send();
      return;
    }
    try {
      votingService.setIsVoteEnded(false);
      const { transaction }: { transaction: string } = req.body;
      await establishNecessaryData(transaction);
      const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
      const toeplitzGroupSignature = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
      dataService.setDataProposal(transaction);
      const calculatedTransactionHash = addProposalPeerToToeplitzGroupSignature();
      await dataService.sendDataProposalToAllPeers(toeplitzGroupSignature);
      startVoting(calculatedTransactionHash);
    } catch (error) {
      console.error(error);
    }
    res.send('Data proposal sent to all peers');
  });
  
  router.post('/receive-data-proposal', jsonParser, async (req, res) => {
    log('Received data proposal');
    try {
      votingService.setIsVoteEnded(false);
      const { dataProposal, toeplitzGroupSignature }: DataProposalRequest = req.body;
      const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
      const calculatedToeplitzHash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, dataProposal);
      const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGroupSignature, calculatedToeplitzHash);
      if (!isVerified) {
        throw Error('Invalid data proposal signature');
      } 
      dataService.setDataProposal(dataProposal);
      toeplitzService.storeToeplitzGroupSignature(toeplitzGroupSignature);
      const calculatedTransactionHash = generateHashedTransaction(calculatedToeplitzHash);
      startVoting(calculatedTransactionHash);
    } catch (error) {
      console.error(error);
      onError();
    }
    res.send('Received data proposal');
  });
  
  router.post('/verify-and-vote', jsonParser, async (req, res) => {
    log('My turn to verify and vote');
    try {
      const { peerQueue, transactionHash } = req.body;
      await waitForDataToPropagate();
      const dataProposal = dataService.getDataProposal();
      const toeplitzGroupSignature = toeplitzService.getToeplitzGroupSignature();
      const isVerified = votingService.verifyVote(dataProposal, toeplitzGroupSignature, transactionHash);
      if (isVerified) {
        throw Error('Non verified');
      } 
      log('Vote verified');
      await votingService.sendAddVoteAllPeers();
      if (votingService.getVotes() >= 12) {
        await votingService.sendVotingFinishedToAllPeers();
      } else {
        if (peerQueue.length !== 0) {
          votingService.initializeVote(peerQueue, transactionHash);
        }
      }
    } catch (error) {
      console.error(error);
      onError();
    }
    res.send('Voted');
  });
  
  router.post('/add-vote', async (req, res) => {
    log('Received add vote request');
    if (votingService.getIsVoteEnded()) {
      res.send('Voting ended');
      return;
    }
    votingService.addVote();
    res.send('Added vote');
  });
  
  router.post('/voting-finished', (req, res) => {
    log('Received voting finished request');
    if (votingService.getIsVoteEnded()) {
      res.send('Voting ended');
      return;
    }
    votingService.setIsVoteEnded(true);
    onSuccess();
    clearEverything();
    res.send('Voting succeeded');
  });

  router.post('/add-node', jsonParser, async (req, res) => {
    log('Adding new node');
    const { nodeAddresses } = req.body as { nodeAddresses: NodeAddresses};
    nodeService.addNodeAddress(nodeAddresses);
    res.send('Added new node');
  });

  return router;
};

