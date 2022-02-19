import { shuffleArray } from '../utils/shuffleArray';
import { wait } from '../utils/wait';
import { log } from '../../shared/utils/log';
import { Services } from '../services/services';
import { matrixMathService } from '../services/matrixMath.service';
import { NodeAddress } from '../../shared/types';
import { shouldUseQKD } from '../utils/shouldUseQKD';

export const buildApiService = (services: Services) => {
	const {
		dataService,
		nodeService,
		oneTimePadService,
		toeplitzService,
		transactionService, 
		votingService,
		qkdService
	} = services;
  
	const clearEverything = () => {
		toeplitzService.clearToeplitzGroupSignature();
		toeplitzService.clearToeplitzMatrixesMapping();
		oneTimePadService.clearOneTimePads();
		transactionService.clearTransactionHash();
		dataService.clearDataProposal();
		votingService.clearVotes();
	};
	const { convertStringToBinary } = matrixMathService();
  
	const establishNecessaryData = async (transaction: string) => {
		const transactionAsBinaryLength = convertStringToBinary(transaction).length;
		await toeplitzService.establishToeplitzMatrix(transactionAsBinaryLength);
		if (shouldUseQKD) {
			await qkdService.establishOneTimePadWithQKD(transaction.length);
		} else {
			await oneTimePadService.establishOneTimePad(transactionAsBinaryLength);
		}
	};
  
	const generateHashedTransaction = (toeplitzHash: string) => {
		const dataProposal = dataService.getDataProposal();
		const calculatedTransactionHash = transactionService.calculateTransactionHash(dataProposal, toeplitzHash);
		transactionService.storeTransactionHash(calculatedTransactionHash);
		return calculatedTransactionHash;
	};
  
	const addProposalPeerToToeplitzGroupSignature = () => {
		const dataProposal = dataService.getDataProposal();
		const toeplitzHash = toeplitzService.generateToeplitzHash(dataProposal);
		const calculatedTransactionHash = generateHashedTransaction(toeplitzHash);
		toeplitzService.addToeplitzHashToGroupSignature(toeplitzHash);
		return calculatedTransactionHash;
	};
  
	const startVoting = (calculatedTransactionHash: string) => {
		log('Starting voting, create peer queue');
		const allNodesAddresses = nodeService.getAllNodesAddresses();
		const randomPeerArray = shuffleArray(allNodesAddresses);
		votingService.initializeVote(randomPeerArray, calculatedTransactionHash);
	};
  
	const waitForDataToPropagate = async () => {
		log('Waiting for data to propagate');
		await wait(() => toeplitzService.getToeplitzGroupSignature().length === 4, 500);
		await wait(() => !!dataService.getDataProposal(), 500);
	};

	const handleReceiveTransaction = async (transaction: string) => {
		votingService.setIsVoteEnded(false);
		await establishNecessaryData(transaction);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const toeplitzGroupSignature = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
		dataService.setDataProposal(transaction);
		const calculatedTransactionHash = addProposalPeerToToeplitzGroupSignature();
		await dataService.sendDataProposalWithGroupSignatureToAllPeers(toeplitzGroupSignature);
		startVoting(calculatedTransactionHash);
	};


	const handleReceiveDataProposal = (dataProposal: string, toeplitzGroupSignature: string[]) => {
		votingService.setIsVoteEnded(false);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const calculatedToeplitzHash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, dataProposal);
		const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGroupSignature, calculatedToeplitzHash);
		if (!isVerified) {
			throw Error('Invalid data proposal signature');
		} 
		dataService.setDataProposal(dataProposal);
		toeplitzService.storeToeplitzGroupSignature(toeplitzGroupSignature);
		const calculatedTransactionHash = generateHashedTransaction(calculatedToeplitzHash);
		startVoting(calculatedTransactionHash);
	};
  
	const handleVerifyAndVote = async (
		peerQueue: NodeAddress[],
		transactionHash: string,
		onSuccess: () => void
	) => {
		await waitForDataToPropagate();
		const dataProposal = dataService.getDataProposal();
		const toeplitzGroupSignature = toeplitzService.getToeplitzGroupSignature();
		const isVerified = votingService.verifyVote(dataProposal, toeplitzGroupSignature, transactionHash);
		if (!isVerified) {
			throw Error('Non verified');
		} 
		log('Vote verified');
		await votingService.sendAddVoteAllPeers();
		if (votingService.getVotes() >= 12) {
			setVoteIsEnded();
			onSuccess();
			await votingService.sendVotingFinishedToAllPeers();
		} else {
			if (peerQueue.length !== 0) {
				votingService.initializeVote(peerQueue, transactionHash);
			}
		}
	};

	const isVoteEnded = () => votingService.getIsVoteEnded();

	const addVote = () => votingService.addVote();

	const setVoteIsEnded = () => votingService.setIsVoteEnded(true);

	const addNodeAddress = (nodeAddress: NodeAddress) => nodeService.addNodeAddress(nodeAddress);

	const checkAndGetToeplitzMatrix = (nodeAddress: string) => toeplitzService.checkIfToeplitzMatrixExists(nodeAddress);

	const getOneTimePad = (nodeAddress: string) => oneTimePadService.getOneTimePadFromMapping(nodeAddress);

	const addToeplitzMatrix = (toeplitzMatrix: number[][], nodeAddress: string) =>
		toeplitzService.addToeplitzMatrix(toeplitzMatrix, nodeAddress);

	const addOneTimePad = (oneTimePad: number[], nodeAddress: string) => 
		oneTimePadService.addOneTimePad(oneTimePad, nodeAddress);

	const fetchAndStoreQKDKey = async (keyId: string, nodeAddress: string) =>
		await qkdService.fetchAndStoreQKDKey(keyId, nodeAddress);


	return {
		handleReceiveTransaction,
		handleReceiveDataProposal,
		handleVerifyAndVote,
		isVoteEnded,
		addVote,
		setVoteIsEnded,
		addNodeAddress,
		checkAndGetToeplitzMatrix,
		getOneTimePad,
		addToeplitzMatrix,
		addOneTimePad,
		fetchAndStoreQKDKey,
		clearEverything,
	};
};

