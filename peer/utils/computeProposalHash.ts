import crypto from 'crypto';
import { NodeAddress } from '../../shared/types';

export const computeProposalHash = (
	teoplitzHash: string,
	nodeAddress: NodeAddress,
	transaction: string,
) => {
	const { address } = nodeAddress;
	const blockString = `${teoplitzHash}-${address}-${transaction}`;
	const hashFunction = crypto.createHash('sha256');
	hashFunction.update(blockString);
	return hashFunction.digest('hex');
};
