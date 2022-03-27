import got from 'got';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { QRNGGetRandomArrayResponse, NodeAddress, QKDGetKeyResponse } from '../../shared/types';
import { Block } from '../types';
dotenv.config({ path: __dirname + '/../.env' });

export const checkIfToeplitzMatrixIsEstablished = async (
	nodeAddress: NodeAddress,
	myNodeAddress: string
) => {
	const { address } = nodeAddress;
	const url = `${address}/check-toeplitz`;
	const response = await got.post(url, {
		json: {
			nodeAddress: myNodeAddress,
		},
		responseType: 'json',
	});
	return response.body as { toeplitzMatrix: number[][] };
};

export const sendTopelitzMatrix = async (
	nodeAddress: NodeAddress,
	toeplitzVector: number[],
	myNodeAddress: string
) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-toeplitz`;
	const response = await got.post(url, {
		json: {
			toeplitzVector,
			nodeAddress: myNodeAddress,
		},
	});
	return response;
};

export const sendOneTimePad = async (
	nodeAddress: NodeAddress,
	oneTimePad: number[],
	myNodeAddress: string
) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-one-time-pad`;
	const response = await got.post(url, {
		json: {
			oneTimePad,
			nodeAddress: myNodeAddress,
		},
	});
	return response;
};

export const sendDataProposal = async (
	nodeAddress: NodeAddress,
	dataProposal: string,
) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-data-proposal`;
	const response = await got.post(url, {
		json: {
			dataProposal,
		},
	});
	return response;
};

export const sendBlockProposal = async (
	nodeAddress: NodeAddress,
	blockProposal: Block,
) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-block-proposal`;
	const response = await got.post(url, {
		json: {
			blockProposal,
		},
	});
	return response;
};

export const sendToeplitzGroupSignature = async (
	nodeAddress: NodeAddress,
	toeplitzGroupSignature: string[]
) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-toeplitz-group-signature`;
	const response = await got.post(url, {
		json: {
			toeplitzGroupSignature,
		},
	});
	return response;
};

export const checkIfOneTimePadIsEstablished = async (
	nodeAddress: NodeAddress,
	myNodeAddress: string
) => {
	const { address } = nodeAddress;
	const url = `${address}/check-one-time-pad`;
	const response = await got.post(url, {
		json: {
			nodeAddress: myNodeAddress,
		},
		responseType: 'json',
	});
	return response.body as { oneTimePad: number[] };
};

export const sendVerifyAndVote = async (
	nodeAddress: NodeAddress,
	peerQueue: NodeAddress[],
	hashedSignature: string,
) => {
	const { address } = nodeAddress;
	const url = `${address}/verify-and-vote`;
	const response = await got.post(url, {
		json: {
			peerQueue,
			hashedSignature,
		},
	});
	return response;
};

export const sendAddVote = async (nodeAddress: NodeAddress) => {
	const { address } = nodeAddress;
	const url = `${address}/add-vote`;
	const response = await got.post(url);
	return response;
};

export const sendVotingFinished = async (nodeAddress: NodeAddress) => {
	const { address } = nodeAddress;
	const url = `${address}/voting-finished`;
	const response = await got.post(url);
	return response;
};

export const getNodesAddressesFromBootstrap = async () => {
	const address = process.env.NODE_ADDRESS;
	const bootstrapNodeAddress = process.env.BOOTSTRAP_NODE_ADDRESS;
	const url = `${bootstrapNodeAddress}/connected-nodes`;
	const response = await got.post(url, {
		json: { 
			address,
		},
		responseType: 'json'
	});
	return response.body as NodeAddress[];
};

export const getQKDKey = async (keyLength: number) => {
	const url = process.env.QKD_GET_KEY_URL;
	if (url) {
		const response = await got.post(url, {
			json: {
				number: 1,
				size: keyLength
			},
			responseType: 'json',
			https: {
				certificateAuthority: fs.readFileSync(path.join(__dirname, '../certs/ca.crt')),
				key: fs.readFileSync(path.join(__dirname, '../certs/clientA.key')),
				certificate: fs.readFileSync(path.join(__dirname, '../certs/clientA.crt'))
			}
		});
		const body = response.body as QKDGetKeyResponse;
		return {
			key: body.keys[0].key,
			keyId: body.keys[0].key_ID
		};
	}
};

export const sendQKDKeyId = async (nodeAddress: NodeAddress, keyId: string) => {
	const { address } = nodeAddress;
	const url = `${address}/receive-qkd-key-id`;
	await got.post(url, {
		json: {
			keyId,
		}
	});
};

export const getQKDKeyById = async (keyId: string) => {
	const url = process.env.QKD_GET_KEY_BY_ID_URL;
	if (url) {
		const { body } = await got.post<QKDGetKeyResponse>(url, {
			json: { 
				key_IDs: [
					{
						key_ID: keyId
					}
				]
			},
			responseType: 'json',
			https: {
				certificateAuthority: fs.readFileSync(path.join(__dirname, '../certs/ca.crt')),
				key: fs.readFileSync(path.join(__dirname, '../certs/clientB.key')),
				certificate: fs.readFileSync(path.join(__dirname, '../certs/clientB.crt'))
			}
		});
		return {
			key: body.keys[0].key,
			keyId: body.keys[0].key_ID
		};
	}
};

export const getQRNGRandomArray = async ({
	length,
	min,
	max
}: { length: number, min: number, max: number }) => {
	const url = process.env.QRNG_GET_RANDOM_ARRAY_URL;
	const apiKey = process.env.QRNG_GET_RANDOM_ARRAY_API_KEY;
	if (url) {
		const urlWithParams = `${url}/${apiKey}/block/short?size=${length}&min=${min}&max=${max}`;
		const { body } = await got.get(
			urlWithParams, 
			{
				https: {
					rejectUnauthorized: false
				}
			}
		);
		const parsedBody = JSON.parse(body) as QRNGGetRandomArrayResponse;
		return parsedBody.data.result;
	}
};

export const sendAddBlockToChain = async (nodeAddress: NodeAddress) => {
	const { address } = nodeAddress;
	const url = `${address}/add-block-to-chain`;
	const response = await got.post(url);
	return response;
};
