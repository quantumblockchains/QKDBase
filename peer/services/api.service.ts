import { wait } from '../utils/wait';
import { log } from '../../shared/utils/log';
import { Services } from './services';
import { matrixMathService } from './matrixMath.service';
import { NodeAddress } from '../../shared/types';
import { shouldUseQKD } from '../utils/shouldUseQKD';
import { shouldUseQRNG } from '../utils/shouldUseQRNG';
import { shuffleArray } from '../utils/shuffleArray';
import { Block } from '../types';

export const buildApiService = (services: Services) => {
	const {
		blockService,
		blockchainService,
		nodeService,
		oneTimePadService,
		toeplitzService,
		transactionService, 
		votingService,
		oneTimePadByQKD,
		toeplitzByQKD,
		qrngService,
	} = services;
  
	const clearEverything = () => {
		toeplitzService.clearToeplitzGroupSignature();
		toeplitzService.clearToeplitzMatrixesMapping();
		oneTimePadService.clearOneTimePads();
		transactionService.clearHashedSignature();
		blockService.clearBlockProposal();
		votingService.clearVotes();
	};
	const { convertStringToBinary, generateToeplitzMatrix } = matrixMathService();
  
	const establishNecessaryData = async (transaction: string) => {
		const transactionAsBinaryLength = convertStringToBinary(transaction).length;
		await blockService.sendBlockProposalToAllPeers();		
		if (shouldUseQKD) {
			await oneTimePadByQKD.establishOneTimePadWithQKD(transaction.length);
			await toeplitzByQKD.establishToeplitzMatrixWithQKD(transaction.length);
		} else {
			await oneTimePadService.establishOneTimePad(transactionAsBinaryLength);
			await toeplitzService.establishToeplitzMatrix(transactionAsBinaryLength);
		}
	};

	const addProposalPeerToToeplitzGroupSignature = () => {
		const blockProposal = blockService.getBlockProposal();
		const dataProposal = blockProposal?.data;
		if (!dataProposal) {
			throw Error('No data in block proposal');
		}
		const hashedSignature = toeplitzService.generateHashedSignature(dataProposal);
		toeplitzService.addHashedSignatureToGroupSignature(hashedSignature);
		return hashedSignature;
	};
  
	const startVoting = async (calculatedHashedSignature: string) => {
		log('Starting voting, creating peer queue');
		let randomPeerArray = nodeService.getAllNodesAddresses();
		if (shouldUseQRNG) {
			randomPeerArray = await qrngService.generateRandomArrayOfNodes();
		} else {
			randomPeerArray = shuffleArray(randomPeerArray);
		}
		votingService.initializeVote(randomPeerArray, calculatedHashedSignature);
	};
  
	const waitForDataToPropagate = async () => {
		log('Waiting for data to propagate');
		await wait(() => toeplitzService.getToeplitzGroupSignature().length === 4, 500);
		await wait(() => !!blockService.getBlockProposal(), 500);
	};

	const handleReceiveTransaction = async (transaction: string) => {
		votingService.setIsVoteEnded(false);
		blockService.createBlockProposal(transaction, blockchainService.getLastBlock());
		await establishNecessaryData(transaction);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const toeplitzGroupSignature = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
		const calculatedHashedSignature = addProposalPeerToToeplitzGroupSignature();
		await toeplitzService.sendToeplitzGroupSignatureToAllPeers(toeplitzGroupSignature);
		startVoting(calculatedHashedSignature);
	};

	const handleReceiveBlockProposal = (blockProposal: Block) => {
		blockService.setBlockProposal(blockProposal);
	};

	const handleReceiveToeplitzGroupSignature = (toeplitzGroupSignature: string[]) => {
		votingService.setIsVoteEnded(false);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const blockProposal = blockService.getBlockProposal();
		const dataProposal = blockProposal?.data;
		if (!dataProposal) {
			throw Error('No data in block proposal');
		}
		const hashedSignature = toeplitzService.calculateHashedSignature(oneTimePadMapping, dataProposal);
		const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGroupSignature, hashedSignature);
	
		if (!isVerified) {
			throw Error('Invalid data proposal signature');
		} 
		toeplitzService.storeToeplitzGroupSignature(toeplitzGroupSignature);
		transactionService.storeHashedSignature(hashedSignature);
		startVoting(hashedSignature);
	};
  
	const handleVerifyAndVote = async (
		peerQueue: NodeAddress[],
		hashedSignature: string,
		onSuccess: () => void
	) => {
		await waitForDataToPropagate();
		const toeplitzGroupSignature = toeplitzService.getToeplitzGroupSignature();
		const isVerified = votingService.verifyVote(toeplitzGroupSignature, hashedSignature);
		if (!isVerified) {
			throw Error('Non verified');
		} 
		log('Vote verified');
		await votingService.sendAddVoteAllPeers();
		if (votingService.getVotes() >= 12) {
			setVoteIsEnded();
			handleAddBlockToChain();
			onSuccess();
			clearEverything();
			await blockService.sendAddBlockToChainToAllPeers();
		} else {
			if (peerQueue.length !== 0) {
				votingService.initializeVote(peerQueue, hashedSignature);
			}
		}
	};

	const handleAddBlockToChain = () => {
		const blockProposal = blockService.getBlockProposal();
		if (!blockProposal) {
			throw Error('No block proposal');
		} 
		blockchainService.addBlock(blockProposal);
		blockchainService.saveBlock(blockProposal);
	};

	const isVoteEnded = () => votingService.getIsVoteEnded();

	const addVote = () => votingService.addVote();

	const setVoteIsEnded = () => votingService.setIsVoteEnded(true);

	const addNodeAddress = (nodeAddress: NodeAddress) => nodeService.addNodeAddress(nodeAddress);

	const checkAndGetToeplitzMatrix = (nodeAddress: string) => toeplitzService.checkIfToeplitzMatrixExists(nodeAddress);

	const getOneTimePad = (nodeAddress: string) => oneTimePadService.getOneTimePadFromMapping(nodeAddress);

	const addToeplitzMatrix = (toeplitzVector: number[], nodeAddress: string) => {
		const toeplitzMatrix = generateToeplitzMatrix(toeplitzVector);
		toeplitzService.addToeplitzMatrix(toeplitzMatrix, nodeAddress);
	};

	const addOneTimePad = (oneTimePad: number[], nodeAddress: string) => 
		oneTimePadService.addOneTimePad(oneTimePad, nodeAddress);

	const fetchAndStoreQKDKey = async (keyId: string, nodeAddress: string) =>
		await oneTimePadByQKD.fetchAndStoreQKDKey(keyId, nodeAddress);

	const fetchAndStoreToeplitzMatrix = async (keyId: string, nodeAddress: string) =>
		await toeplitzByQKD.fetchAndStoreToeplitzMatrix(keyId, nodeAddress);

	return {
		handleReceiveTransaction,
		handleReceiveToeplitzGroupSignature,
		handleReceiveBlockProposal,
		handleVerifyAndVote,
		handleAddBlockToChain,
		isVoteEnded,
		addVote,
		setVoteIsEnded,
		addNodeAddress,
		checkAndGetToeplitzMatrix,
		getOneTimePad,
		addToeplitzMatrix,
		addOneTimePad,
		fetchAndStoreQKDKey,
		fetchAndStoreToeplitzMatrix,
		clearEverything,
	};
};

