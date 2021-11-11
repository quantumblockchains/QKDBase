import express from 'express';
import { shuffleArray } from '../utils/shuffleArray';
import { wait } from '../utils/wait';
import { log } from '../utils/log';
import { Services } from '../services/services';

export const getNormalRoutes = (services: Services) => {
  const router = express.Router();
  const jsonParser = express.json();

  const { blockService, blockchainService, nodeService, oneTimePadService, toeplitzService, transactionService, votingService } = services;
  
  const clearEverything = () => {
    toeplitzService.clearToeplitzGroupSignature();
    oneTimePadService.clearOneTimePads();
    transactionService.clearTransactionHash();
    blockService.clearBlockProposal();
    votingService.clearVotes();
  };
  
  const establishNecessaryData = async () => {
    await toeplitzService.establishToeplitzMatrix();
    await oneTimePadService.establishOneTimePad();
  };
  
  const generateHashedTransaction = (toeplitzHash: string) => {
    const blockProposal = blockService.getBlockProposal();
    const calculatedTransactionHash = transactionService.calculateTransactionHash(blockProposal, toeplitzHash);
    transactionService.storeTransactionHash(calculatedTransactionHash);
    return calculatedTransactionHash;
  }
  
  const addProposalPeerToToeplitzGroupSignature = () => {
    const blockProposal = blockService.getBlockProposal();
    const toeplitzHash = toeplitzService.generateToeplitzHash(blockProposal);
    const calculatedTransactionHash = generateHashedTransaction(toeplitzHash);
    toeplitzService.addToeplitzHashToGroupSignature(toeplitzHash);
    return calculatedTransactionHash;
  };
  
  const startVoting = (calculatedTransactionHash: string) => {
    log('Starting voting, create peer queue');
    const allNodesHashes = nodeService.getAllNodesHashes()
    const randomPeerArray = shuffleArray(allNodesHashes);
    votingService.initializeVote(randomPeerArray, calculatedTransactionHash);
  };
  
  const waitForDataToPropagate = async () => {
    log('Waiting for data to propagate');
    await wait(() => toeplitzService.getToeplitzGroupSignature().length === 4, 500);
    await wait(() => !!blockService.getBlockProposal(), 500);
  };
  
  
  router.post('/receive-transaction', jsonParser, async (req, res) => {
    log('Received transaction');
    if (nodeService.getMyNodeHash() !== '313c7cdbb127b808387486993859a2be864711cbf80f1ea89038bd09') {
      res.send();
      return;
    }
    try {
      votingService.setIsVoteEnded(false);
      const { transaction } = req.body;
      if (transaction.length !== 5) {
        throw Error('Invalid transaction length');
      }
      await establishNecessaryData();
      const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
      const toeplitzGroupSignature = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
      blockService.createBlockProposal(transaction, blockchainService.getLastBlock());
      const calculatedTransactionHash = addProposalPeerToToeplitzGroupSignature();
      await blockService.sendBlockProposalToAllPeers(toeplitzGroupSignature);
      startVoting(calculatedTransactionHash);
    } catch (error) {
      console.error(error);
    }
    res.send('Block proposal sent to all peers');
  });
  
  router.post('/receive-block-proposal', jsonParser, async (req, res) => {
    log('Received block proposal');
    try {
      votingService.setIsVoteEnded(false);
      const { blockProposal, toeplitzGroupSignature } = req.body;
      const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
      const calculatedToeplitzHash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, blockProposal);
      const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGroupSignature, calculatedToeplitzHash);
      if (isVerified) {
        blockService.setBlockProposal(blockProposal);
        toeplitzService.storeToeplitzGroupSignature(toeplitzGroupSignature);
        const calculatedTransactionHash = generateHashedTransaction(calculatedToeplitzHash);
        startVoting(calculatedTransactionHash);
      } else {
        throw Error('Invalid block proposal signature');
      }
    } catch (error) {
      console.error(error);
    }
    res.send('Received block proposal');
  });
  
  router.post('/verify-and-vote', jsonParser, async (req, res) => {
    log('My turn to verify and vote');
    try {
      const { peerQueue, transactionHash } = req.body;
      await waitForDataToPropagate();
      const blockProposal = blockService.getBlockProposal();
      const toeplitzGroupSignature = toeplitzService.getToeplitzGroupSignature();
      const isVerified = votingService.verifyVote(blockProposal, toeplitzGroupSignature, transactionHash);
      if (isVerified) {
        log('Vote verified');
        await votingService.sendAddVoteAllPeers();
        if (votingService.getVotes() >= 12) {
          await votingService.sendAddBlockToChainToAllPeers();
        } else {
          if (peerQueue.length !== 0) {
            votingService.initializeVote(peerQueue, transactionHash);
          }
        }
      } else {
        throw Error('Non verified');
      }
    } catch (error) {
      console.error(error);
    }
    res.send('Voted');
  });
  
  router.post('/add-vote', async (req, res) => {
    log('Received add vote request');
    if (votingService.getIsVoteEnded()) {
      res.send('Vote ended');
      return;
    }
    try {
      votingService.addVote();
    } catch (error) {
      console.error(error);
    }
    res.send('Added vote');
  });
  
  router.post('/add-block-to-chain', (req, res) => {
    log('Received add block to chain request');
    if (votingService.getIsVoteEnded()) {
      res.send('Vote ended');
      return;
    }
    try {
      votingService.setIsVoteEnded(true);
      const blockProposal = blockService.getBlockProposal();
      blockchainService.addBlock(blockProposal);
      blockchainService.saveBlock(blockProposal);
      log('\x1b[31m CONSENSUS ACHIEVED \x1b[0m');
      clearEverything();
    } catch (error) {
      console.error(error);
    }
    res.send('Added block to chain');
  });
  
  router.get('/show-last-block', (req, res) => {
    res.send(blockchainService.getLastBlock());
  });
  
  router.get('/show-block-proposal', (req, res) => {
    res.send(blockService.getBlockProposal());
  });
  
  router.get('/show-hashed-transaction', (req, res) => {
    res.send(transactionService.getTransactionHash());
  });

  return router;
}

