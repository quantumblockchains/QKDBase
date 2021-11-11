import { Block } from '../types';
import { computeProposalHash } from '../utils/computeProposalHash';
import { nodeService } from './nodeService';
import { log } from '../utils/log';

export const transactionService = () => {
  let transactionHash: string | undefined;

  const { getMyNodeHash } = nodeService();
  const myNodeHash = getMyNodeHash();

  const calculateTransactionHash = (blockProposal: Block, toeplitzHash: string) => {
    log('Calculating my hashed transaction');
    return computeProposalHash(toeplitzHash, myNodeHash, blockProposal.data);
  }

  const storeTransactionHash = (hashedTransaction: string) => {
    log('Storing my hashed transaction');
    transactionHash = hashedTransaction;
  }

  const getTransactionHash = () => transactionHash;

  const clearTransactionHash = () => {
    transactionHash = undefined;
  };

  return {
    calculateTransactionHash,
    storeTransactionHash,
    getTransactionHash,
    clearTransactionHash,
  };
};
