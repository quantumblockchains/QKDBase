import express from 'express';
import { log } from '../../shared/utils/log';
import { Services } from '../services/services';
import { DataProposalRequest } from '../types';
import { NodeAddress } from '../../shared/types';
import { buildApiService } from './api.service';

export const buildApiRouter = (services: Services, onSuccess: () => void, onError: () => void) => {
	const router = express.Router();
	const jsonParser = express.json();

	const controller = buildApiService(services);

	const {
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
		clearEverything
	} = controller;
  
	router.post('/receive-transaction', jsonParser, async (req, res) => {
		log('Received transaction');
		try {
			const { transaction }: { transaction: string } = req.body;
			await handleReceiveTransaction(transaction);
		} catch (error) {
			console.error(error);
		}
		res.send('Data proposal sent to all peers');
	});

	router.post('/receive-data-proposal', jsonParser, async (req, res) => {
		log('Received data proposal');
		try {
			const { dataProposal, toeplitzGroupSignature }: DataProposalRequest = req.body;
			handleReceiveDataProposal(dataProposal, toeplitzGroupSignature);
		} catch (error) {
			console.error(error);
			onError();
		}
		res.send('Received data proposal');
	});
  

	router.post('/verify-and-vote', jsonParser, async (req, res) => {
		log('My turn to verify and vote');
		try {
			if (isVoteEnded()) {
				res.send('Voting ended');
				return;
			}
			const { peerQueue, transactionHash } = req.body;
			await handleVerifyAndVote(peerQueue, transactionHash, onSuccess);
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
			const { toeplitzMatrix, nodeAddress } = req.body;
			addToeplitzMatrix(toeplitzMatrix, nodeAddress);
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

	return router;
};
