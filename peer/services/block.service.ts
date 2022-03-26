import { Block } from '../types';
import { computeBlockHash } from '../utils/computeBlockHash';
import { sendBlockProposal } from './http.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';

export const blockService = (nodeService: NodeService) => {
	let blockProposal: Block | undefined = undefined;

	const { getContiguousNodesAddresses } = nodeService;

	const createBlockProposal = (
		transaction: string,
		lastBlock: Block,
	) => {
		log('Generating block proposal');
		const blockProposal = generateBlockProposal(transaction, lastBlock);
		setBlockProposal(blockProposal);
	};

	const sendBlockProposalToAllPeers = async () => {
		log('Sending block proposal to peers');
		if (!blockProposal) {
			throw Error('Missing block proposal');
		} 
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			await sendBlockProposal(nodeAddress, blockProposal);
		}
	};

	const setBlockProposal = (block: Block) => {
		log('Storing block proposal');
		if (blockProposal && !compareBlocks(blockProposal, block)) {
			throw Error('Invalid block proposal');
		} else if (!blockProposal) {
			blockProposal = block;
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
		(key) => leftBlock[key as keyof Block] === rightBlock[key as keyof Block]
	);
