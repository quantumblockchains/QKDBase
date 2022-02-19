import { computeHashedSignature } from '../utils/computeHashedSignature';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';

export const buildTransactionService = (nodeService: NodeService) => {
	let hashedSignature: string | undefined;

	const { getMyNodeAddresses } = nodeService;

	const calculateHashedSignature = (toeplitzSignature: string) => {
		log('Calculating my hashed transaction');
		const myNodeAddress = getMyNodeAddresses();
		return computeHashedSignature(toeplitzSignature, myNodeAddress.address);
	};

	const storeHashedSignature = (hashedTransaction: string) => {
		log('Storing my hashed transaction');
		hashedSignature = hashedTransaction;
	};

	const getHashedSignature = () => hashedSignature;

	const clearHashedSignature = () => {
		hashedSignature = undefined;
	};

	return {
		calculateHashedSignature,
		storeHashedSignature,
		getHashedSignature,
		clearHashedSignature,
	};
};
