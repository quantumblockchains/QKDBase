import { computeProposalHash } from '../utils/computeProposalHash';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';

export const buildTransactionService = (nodeService: NodeService) => {
  let transactionHash: string | undefined;

  const { getMyNodeAddresses } = nodeService;

  const calculateTransactionHash = (dataProposal: string, toeplitzHash: string) => {
    log('Calculating my hashed transaction');
    const myNodeAddress = getMyNodeAddresses();
    return computeProposalHash(toeplitzHash, myNodeAddress, dataProposal);
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
