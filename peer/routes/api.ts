import express from 'express';
import { log } from '../../shared/utils/log';
import { Services } from '../services/services';
import { Block } from '../types';
import { NodeAddress } from '../../shared/types';
import { buildApiService } from '../services/api.service';

export const buildApiRouter = (services: Services, onSuccess: () => void, onError: () => void) => {
	const router = express.Router();
	const jsonParser = express.json();

	const apiService = buildApiService(services);

	const {
		handleReceiveTransaction,
		handleReceiveBlockProposal,
		handleReceiveToeplitzGroupSignature,
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
		clearEverything
	} = apiService;
  
	router.post('/receive-transaction', jsonParser, async (req, res) => {
		log('Received transaction');
		try {
			const { transaction }: { transaction: string } = req.body;
			await handleReceiveTransaction(transaction);
		} catch (error) {
			console.error(error);
		}
		res.send('Voting started');
	});

	router.post('/receive-block-proposal', jsonParser, async (req, res) => {
		log('Received block proposal');
		try {
			const { blockProposal }: { blockProposal: Block } = req.body;
			handleReceiveBlockProposal(blockProposal);
		} catch (error) {
			console.error(error);
			onError();
		}
		res.send('Received block proposal');
	});

	router.post('/receive-toeplitz-group-signature', jsonParser, async (req, res) => {
		log('Received Toeplitz Group Signature');
		try {
			const { toeplitzGroupSignature }: { toeplitzGroupSignature: string[] } = req.body;
			handleReceiveToeplitzGroupSignature(toeplitzGroupSignature);
		} catch (error) {
			console.error(error);
			onError();
		}
		res.send('Received Toeplitz Group Signature');
	});
  
	router.post('/verify-and-vote', jsonParser, async (req, res) => {
		log('My turn to verify and vote');
		try {
			if (isVoteEnded()) {
				res.send('Voting ended');
				return;
			}
			const { peerQueue, hashedSignature } = req.body;
			await handleVerifyAndVote(peerQueue, hashedSignature, onSuccess);
		} catch (error) {
			console.error(error);
			onError();
		}
		res.send('Voted');
	});
  
	router.post('/add-vote', async (_req, res) => {
		log('Received add vote request');
		if (isVoteEnded()) {
			res.send('Voting ended');
			return;
		}
		addVote();
		res.send('Added vote');
	});

	router.post('/add-block-to-chain', (_req, res) => {
		log('Received add block to chain request');
		if (isVoteEnded()) {
			res.send('Vote ended');
			return;
		}
		try {
			setVoteIsEnded();
			handleAddBlockToChain();
			onSuccess();
			clearEverything();
		} catch (error) {
			console.error(error);
		}
		res.send('Added block to chain');
	});
  
	router.post('/voting-finished', (_req, res) => {
		log('Received voting finished request');
		if (isVoteEnded()) {
			res.send('Voting ended');
		} else {
			setVoteIsEnded();
			onSuccess();
			clearEverything();
			res.send('Voting succeeded');
		}
	});

	router.post('/add-node', jsonParser, async (req, res) => {
		log('Adding new node');
		const { nodeAddress } = req.body as { nodeAddress: NodeAddress};
		addNodeAddress(nodeAddress);
		res.send('Added new node');
	});

	router.post('/check-toeplitz', jsonParser, (req, res) => {
		log('Received check Toepltiz matrix request');
		const { nodeAddress } = req.body;
		const toeplitzMatrix = checkAndGetToeplitzMatrix(nodeAddress);
		log('Sending found Toeplitz matrix');
		res.send({ toeplitzMatrix });
	});

	router.post('/check-one-time-pad', jsonParser, (req, res) => {
		log('Received check one time pad request');
		const { nodeAddress } = req.body;
		const oneTimePad = getOneTimePad(nodeAddress);
		log('Sending found one time pad');
		res.send({ oneTimePad });
	});

	router.post('/receive-toeplitz', jsonParser, async (req, res) => {
		log('Received request to store established Toeplitz matrix');
		try {
			const { toeplitzVector, nodeAddress } = req.body;
			addToeplitzMatrix(toeplitzVector, nodeAddress);
		} catch (error) {
			console.error(error);
		}
		res.send('Toeplitz string added');
	});

	router.post('/receive-one-time-pad', jsonParser, async (req, res) => {
		log('Received request to store established one time pad');
		try {
			const { oneTimePad, nodeAddress } = req.body;
			addOneTimePad(oneTimePad, nodeAddress);
		} catch (error) {
			console.error(error);
		}
		res.send('One-time pad added');
	});
  
	router.post('/receive-qkd-key-id', jsonParser, async (req, res) => {
		log('Received QKD key id');
		try {
			const { keyId, nodeAddress } = req.body;
			log('Fetching QKD key and storing as one time pad key');
			await fetchAndStoreQKDKey(keyId, nodeAddress);
		} catch (error) {
			console.error(error);
		}
		res.send('One-time pad added');
	});

	router.post('/receive-toeplitz-vector-by-qkd', jsonParser, async (req, res) => {
		log('Received toeplitz vector id');
		try {
			const { keyId, nodeAddress } = req.body;
			log('Fetching toeplitz vector and storing as toeplitz matrix');
			await fetchAndStoreToeplitzMatrix(keyId, nodeAddress);
		} catch (error) {
			console.error(error);
		}
		res.send('Toeplitz matrix added');
	});

	return router;
};
