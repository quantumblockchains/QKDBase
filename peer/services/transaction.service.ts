import { computeProposalHash } from '../utils/computeProposalHash';
import { nodeService } from './node.service';
import { log } from '../utils/log';

export const transactionService = (() => {
  let transactionHash: string | undefined;

  const { getMyNodeHash } = nodeService;
  const myNodeHash = getMyNodeHash();

  const calculateTransactionHash = (dataProposal: string, toeplitzHash: string) => {
    log('Calculating my hashed transaction');
    return computeProposalHash(toeplitzHash, myNodeHash, dataProposal);
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
})();
