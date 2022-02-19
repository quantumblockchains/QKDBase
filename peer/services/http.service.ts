import got from 'got';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { NodeAddress, QKDGetKeyResponse } from '../../shared/types';
dotenv.config();

export const checkIfToeplitzMatrixIsEstablished = async (
	nodeAddress: NodeAddress,
	myNodeAddress: string
) => {
	const { address, port } = nodeAddress;
	const url = `${address}:${port}/check-toeplitz`;
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
	toeplitzMatrix: number[][],
	myNodeAddress: string
) => {
	const { address, port } = nodeAddress;
	const url = `${address}:${port}/receive-toeplitz`;
	const response = await got.post(url, {
		json: {
			toeplitzMatrix,
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
	const { address, port } = nodeAddress;
	const url = `${address}:${port}/receive-one-time-pad`;
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
	const { address, port} = nodeAddress;
	const url = `${address}:${port}/receive-data-proposal`;
	const response = await got.post(url, {
		json: {
			dataProposal,
		},
	});
	return response;
};

export const sendToeplitzGroupSignature = async (
	nodeAddress: NodeAddress,
	toeplitzGroupSignature: string[]
) => {
	const { address, port} = nodeAddress;
	const url = `${address}:${port}/receive-toeplitz-group-signature`;
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
	const { address, port } = nodeAddress;
	const url = `${address}:${port}/check-one-time-pad`;
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
	const { address, port} = nodeAddress;
	const url = `${address}:${port}/verify-and-vote`;
	const response = await got.post(url, {
		json: {
			peerQueue,
			hashedSignature,
		},
	});
	return response;
};

export const sendAddVote = async (nodeAddress: NodeAddress) => {
	const { address, port} = nodeAddress;
	const url = `${address}:${port}/add-vote`;
	const response = await got.post(url);
	return response;
};

export const sendVotingFinished = async (nodeAddress: NodeAddress) => {
	const { address, port} = nodeAddress;
	const url = `${address}:${port}/voting-finished`;
	const response = await got.post(url);
	return response;
};

export const getNodesAddressesFromBootstrap = async () => {
	const address = process.env.NODE_ADDRESS;
	const port = process.env.PORT;
	const bootstrapNodeAddress = process.env.BOOTSTRAP_NODE_ADDRESS;
	const url = `${bootstrapNodeAddress}/connected-nodes`;
	const response = await got.post(url, {
		json: { 
			address,
			port,
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
	const { address, port } = nodeAddress;
	const url = `${address}:${port}/receive-qkd-key-id`;
	await got.post(url, {
		json: {
			keyId,
		},
	});
};

export const getQKDKeyById = async (keyId: string) => {
	const url = process.env.QKD_GET_KEY_BY_ID_URL;
	if (url) {
		const response = await got.post(url, {
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
		const body = response.body as QKDGetKeyResponse;
		return {
			key: body.keys[0].key,
			keyId: body.keys[0].key_ID
		};
	}
};
