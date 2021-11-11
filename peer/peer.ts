import express from 'express';
import bodyParser from 'body-parser';
import { blockchainService } from './services/blockchainService';
import { toeplitzService } from './services/toeplitzService';
import { blockService } from './services/blockService';
import { oneTimePadService } from './services/oneTimePadService';
import { transactionService } from './services/transactionService';
import { votingService } from './services/votingService';
import { nodeService } from './services/nodeService';
import { shuffleArray } from './utils/shuffleArray';
import { wait } from './utils/wait';
import { log } from './utils/log';

const normalConnection = express();
const quantumConnection = express();
const jsonParser = bodyParser.json();
const normalConnectionPort = 3016;
const quantumConnectionPort = 3017;

const { getAllNodesHashes, getMyNodeHash } = nodeService();

const { getLastBlock, addBlock, saveBlock } = blockchainService();

const {
  establishToeplitzMatrix,
  checkIfToeplitzAsStringExists,
  calculateToeplitzHash,
  generateToeplitzHash,
  verifyToeplitzGroupSignature,
  addToeplitzMatrix,
  getToeplitzMapping,
  generateToeplitzGroupSignature,
  storeToeplitzGroupSignature,
  getToeplitzGroupSignature,
  addToeplitzHashToGroupSignature,
  clearToeplitzGroupSignature,
} = toeplitzService();

const {
  establishOneTimePad,
  checkIfOneTimePadExists,
  addOneTimePad,
  clearOneTimePads,
  getOneTimePadMapping,
} = oneTimePadService();

const {
  createBlockProposal,
  sendBlockProposalToAllPeers,
  setBlockProposal,
  getBlockProposal,
  clearBlockProposal,
} = blockService();

const {
  calculateTransactionHash,
  storeTransactionHash,
  getTransactionHash,
  clearTransactionHash,
} = transactionService();

const {
  initializeVote,
  verifyVote,
  addVote,
  getVotes,
  sendAddVoteAllPeers,
  sendAddBlockToChainToAllPeers,
  clearVotes,
  setIsVoteEnded,
  getIsVoteEnded,
} = votingService();

const clearEverything = () => {
  clearToeplitzGroupSignature();
  clearOneTimePads();
  clearTransactionHash();
  clearBlockProposal();
  clearVotes();
};

const establishNecessaryData = async () => {
  await establishToeplitzMatrix();
  await establishOneTimePad();
};

const generateHashedTransaction = (toeplitzHash: string) => {
  const calculatedTransactionHash = calculateTransactionHash(getBlockProposal(), toeplitzHash);
  storeTransactionHash(calculatedTransactionHash);
  return calculatedTransactionHash;
}

const addProposalPeerToToeplitzGroupSignature = () => {
  const toeplitzHash = generateToeplitzHash(getBlockProposal());
  const calculatedTransactionHash = generateHashedTransaction(toeplitzHash);
  addToeplitzHashToGroupSignature(toeplitzHash);
  return calculatedTransactionHash;
};

const startVoting = (calculatedTransactionHash: string) => {
  log('Starting voting, create peer queue');
  const randomPeerArray = shuffleArray(getAllNodesHashes());
  initializeVote(randomPeerArray, calculatedTransactionHash);
};

const waitForDataToPropagate = async () => {
  log('Waiting for data to propagate');
  await wait(() => getToeplitzGroupSignature().length === 4, 500);
  await wait(() => !!getBlockProposal(), 500);
};

normalConnection.post('/receive-transaction', jsonParser, async (req, res) => {
  log('Received transaction');
  if (getMyNodeHash() !== '313c7cdbb127b808387486993859a2be864711cbf80f1ea89038bd09') {
    res.send();
    return;
  }
  try {
    setIsVoteEnded(false);
    const { transaction } = req.body;
    if (transaction.length !== 5) {
      throw Error('Invalid transaction length');
    }
    await establishNecessaryData();
    const toeplitzGroupSignature = generateToeplitzGroupSignature(
      getToeplitzMapping(),
      getOneTimePadMapping(),
      transaction
    );
    createBlockProposal(transaction, getLastBlock());
    const calculatedTransactionHash = addProposalPeerToToeplitzGroupSignature();
    await sendBlockProposalToAllPeers(toeplitzGroupSignature);
    startVoting(calculatedTransactionHash);
  } catch (error) {
    console.error(error);
  }
  res.send('Block proposal sent to all peers');
});

normalConnection.post('/receive-block-proposal', jsonParser, async (req, res) => {
  log('Received block proposal');
  try {
    setIsVoteEnded(false);
    const { blockProposal, toeplitzGroupSignature } = req.body;
    const calculatedToeplitzHash = calculateToeplitzHash(getToeplitzMapping(), getOneTimePadMapping(), blockProposal);
    const isVerified = verifyToeplitzGroupSignature(toeplitzGroupSignature, calculatedToeplitzHash);
    if (isVerified) {
      setBlockProposal(blockProposal);
      storeToeplitzGroupSignature(toeplitzGroupSignature);
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

normalConnection.post('/verify-and-vote', jsonParser, async (req, res) => {
  log('My turn to verify and vote');
  try {
    const { peerQueue, transactionHash } = req.body;
    await waitForDataToPropagate();
    const isVerified = verifyVote(getBlockProposal(), getToeplitzGroupSignature(), transactionHash);
    if (isVerified) {
      log('Vote verified');
      await sendAddVoteAllPeers();
      if (getVotes() >= 12) {
        await sendAddBlockToChainToAllPeers();
      } else {
        if (peerQueue.length !== 0) {
          initializeVote(peerQueue, transactionHash);
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

normalConnection.post('/add-vote', async (req, res) => {
  log('Received add vote request');
  if (getIsVoteEnded()) {
    res.send('Vote ended');
    return;
  }
  try {
    addVote();
  } catch (error) {
    console.error(error);
  }
  res.send('Added vote');
});

normalConnection.post('/add-block-to-chain', (req, res) => {
  log('Received add block to chain request');
  if (getIsVoteEnded()) {
    res.send('Vote ended');
    return;
  }
  try {
    setIsVoteEnded(true);
    addBlock(getBlockProposal());
    saveBlock(getLastBlock());
    log('\x1b[31m CONSENSUS ACHIEVED \x1b[0m');
    clearEverything();
  } catch (error) {
    console.error(error);
  }
  res.send('Added block to chain');
});

normalConnection.get('/show-last-block', (req, res) => {
  res.send(getLastBlock());
});

normalConnection.get('/show-block-proposal', (req, res) => {
  res.send(getBlockProposal());
});

normalConnection.get('/show-hashed-transaction', (req, res) => {
  res.send(getTransactionHash());
});

normalConnection.listen(normalConnectionPort, () => {
  log('Peer normal connection listening');
});

quantumConnection.post('/check-toeplitz', jsonParser, (req, res) => {
  log('Received check Toepltiz matrix request');
  const { nodeHash } = req.body;
  const toeplitzMatrix = checkIfToeplitzAsStringExists(nodeHash);
  log('Sending found Toeplitz matrix');
  res.send({ toeplitzMatrix });
});

quantumConnection.post('/check-one-time-pad', jsonParser, (req, res) => {
  log('Received check one time pad request');
  const { nodeHash } = req.body;
  const oneTimePad = checkIfOneTimePadExists(nodeHash);
  log('Sending found one time pad');
  res.send({ oneTimePad });
});

quantumConnection.post('/receive-toeplitz', jsonParser, async (req, res) => {
  log('Received request to store established Toeplitz matrix');
  try {
    const { toeplitzMatrix, nodeHash } = req.body;
    addToeplitzMatrix(toeplitzMatrix, nodeHash);
  } catch (error) {
    console.error(error);
  }
  res.send('Toeplitz string added');
});

quantumConnection.post('/receive-one-time-pad', jsonParser, async (req, res) => {
  log('Received request to store established one time pad');
  try {
    const { oneTimePad, nodeHash } = req.body;
    addOneTimePad(oneTimePad, nodeHash);
  } catch (error) {
    console.error(error);
  }
  res.send('One-time pad added');
});

quantumConnection.get('/show-toeplitz', (req, res) => {
  res.send(getToeplitzMapping());
});

quantumConnection.get('/show-one-time-pad', (req, res) => {
  res.send(getOneTimePadMapping());
});

quantumConnection.listen(quantumConnectionPort, () => {
  log('Peer quantum connection listening');
});
