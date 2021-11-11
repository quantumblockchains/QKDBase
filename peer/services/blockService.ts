import { Block } from '../types';
import { computeBlockHash } from '../utils/computeBlockHash';
import { sendBlockProposal } from './api';
import { nodeService } from './nodeService';
import { log } from '../utils/log';

export const blockService = () => {
  let blockProposal: Block | undefined = undefined;

  const { getContiguousNodesHashes } = nodeService();
  const contiguousNodesHashes = getContiguousNodesHashes();

  const createBlockProposal = (
    transaction: string,
    lastBlock: Block,
  ) => {
    log('Generating block proposal');
    const blockProposal = generateBlockProposal(transaction, lastBlock);
    setBlockProposal(blockProposal);
  };

  const sendBlockProposalToAllPeers = async (toeplitzGroupSignature: string[]) => {
    log('Sending block proposal to peers');
    for (const nodeHash of contiguousNodesHashes) {
      await sendBlockProposal(nodeHash, blockProposal, toeplitzGroupSignature);
    }
  };

  const setBlockProposal = (block: Block) => {
    log('Storing block proposal');
    if (!blockProposal) {
      blockProposal = block;
    } else if (blockProposal && !compareBlocks(blockProposal, block)) {
      throw Error('Invalid block proposal');
    }
  };

  const getBlockProposal = () => blockProposal;

  const clearBlockProposal = () => {
    blockProposal = undefined;
  };

  return {
    createBlockProposal,
    sendBlockProposalToAllPeers,
    setBlockProposal,
    getBlockProposal,
    clearBlockProposal,
  };
};

export const generateBlockProposal = (
  transaction: string,
  lastBlock: Block
): Block => {
  const index = lastBlock.index + 1;
  const previousBlockHash = lastBlock.hash;
  const timestamp = Date.now();

  return {
    index,
    previousBlockHash,
    data: transaction,
    timestamp,
    hash: computeBlockHash(index, transaction, timestamp, previousBlockHash),
  };
};

const compareBlocks = (leftBlock: Block, rightBlock: Block) =>
  Object.keys(leftBlock).every(
    (key: keyof Block) => leftBlock[key] === rightBlock[key]
  );
