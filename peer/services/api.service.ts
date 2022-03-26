import { wait } from '../utils/wait';
import { log } from '../../shared/utils/log';
import { Services } from './services';
import { matrixMathService } from './matrixMath.service';
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
		qkdService,
		qrngService,
	} = services;
  
	const clearEverything = () => {
		toeplitzService.clearToeplitzGroupSignature();
		toeplitzService.clearToeplitzMatrixesMapping();
		oneTimePadService.clearOneTimePads();
		transactionService.clearHashedSignature();
		dataService.clearDataProposal();
		votingService.clearVotes();
	};
	const { convertStringToBinary, generateToeplitzMatrix } = matrixMathService();
  
	const establishNecessaryData = async (transaction: string) => {
		const transactionAsBinaryLength = convertStringToBinary(transaction).length;
		await dataService.sendDataProposalToAllPeers();
		await toeplitzService.establishToeplitzMatrix(transactionAsBinaryLength);
		if (shouldUseQKD) {
			await qkdService.establishOneTimePadWithQKD(transaction.length);
		} else {
			await oneTimePadService.establishOneTimePad(transactionAsBinaryLength);
		}
	};

	const addProposalPeerToToeplitzGroupSignature = () => {
		const dataProposal = dataService.getDataProposal();
		const hashedSignature = toeplitzService.generateHashedSignature(dataProposal);
		toeplitzService.addHashedSignatureToGroupSignature(hashedSignature);
		return hashedSignature;
	};
  
	const startVoting = async (calculatedHashedSignature: string) => {
		log('Starting voting, create peer queue');
		const randomPeerArray = await qrngService.generateRandomArrayOfNodes();
		votingService.initializeVote(randomPeerArray, calculatedHashedSignature);
	};
  
	const waitForDataToPropagate = async () => {
		log('Waiting for data to propagate');
		await wait(() => toeplitzService.getToeplitzGroupSignature().length === 4, 500);
		await wait(() => !!dataService.getDataProposal(), 500);
	};

	const handleReceiveTransaction = async (transaction: string) => {
		votingService.setIsVoteEnded(false);
		dataService.setDataProposal(transaction);
		await establishNecessaryData(transaction);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const toeplitzGroupSignature = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
		const calculatedHashedSignature = addProposalPeerToToeplitzGroupSignature();
		await toeplitzService.sendToeplitzGroupSignatureToAllPeers(toeplitzGroupSignature);
		startVoting(calculatedHashedSignature);
	};

	const handleReceiveDataProposal = (dataProposal: string) => {
		dataService.setDataProposal(dataProposal);
	};

	const handleReceiveToeplitzGroupSignature = (toeplitzGroupSignature: string[]) => {
		votingService.setIsVoteEnded(false);
		const oneTimePadMapping = oneTimePadService.getOneTimePadMapping();
		const dataProposal = dataService.getDataProposal();
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
			onSuccess();
			clearEverything();
			await votingService.sendVotingFinishedToAllPeers();
		} else {
			if (peerQueue.length !== 0) {
				votingService.initializeVote(peerQueue, hashedSignature);
			}
		}
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
		await qkdService.fetchAndStoreQKDKey(keyId, nodeAddress);


	return {
		handleReceiveTransaction,
		handleReceiveToeplitzGroupSignature,
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

