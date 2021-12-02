import crypto from 'crypto';
import { NodeAddresses } from '../../shared/types';

export const computeProposalHash = (
  teoplitzHash: string,
  nodeAddresses: NodeAddresses,
  transaction: string,
) => {
  const { address } = nodeAddresses;
  const blockString = `${teoplitzHash}-${address}-${transaction}`;
  const hashFunction = crypto.createHash('sha256');
  hashFunction.update(blockString);
  return hashFunction.digest('hex');
};
