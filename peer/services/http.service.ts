import got from 'got';
import dotenv from 'dotenv';
import { Block } from '../types';
import { NodeAddresses } from '../../shared/types';
dotenv.config();

export const checkIfToeplitzMatrixIsEstablished = async (
  nodeAddresses: NodeAddresses,
  myNodeAddress: string
) => {
  const { address, quantumConnectionPort} = nodeAddresses;
  const url = `${address}:${quantumConnectionPort}/check-toeplitz`;
  const response = await got.post(url, {
    json: {
      address: myNodeAddress,
    },
    responseType: 'json',
  });
  return response.body as { toeplitzMatrix: number[][] };
};

export const sendTopelitzMatrix = async (
  nodeAddresses: NodeAddresses,
  toeplitzMatrix: number[][],
  myNodeAddress: string
) => {
  const { address, quantumConnectionPort} = nodeAddresses;
  const url = `${address}:${quantumConnectionPort}/receive-toeplitz`;
  const response = await got.post(url, {
    json: {
      toeplitzMatrix,
      address: myNodeAddress,
    },
  });
  return response;
};

export const sendOneTimePad = async (
  nodeAddresses: NodeAddresses,
  oneTimePad: number[],
  myNodeAddress: string
) => {
  const { address, quantumConnectionPort} = nodeAddresses;
  const url = `${address}:${quantumConnectionPort}/receive-one-time-pad`;
  const response = await got.post(url, {
    json: {
      oneTimePad,
      address: myNodeAddress,
    },
  });
  return response;
};

export const sendBlockProposal = async (
  nodeAddresses: NodeAddresses,
  blockProposal: Block,
  toeplitzGroupSignature: string[]
) => {
  const { address, normalConnectionPort} = nodeAddresses;
  const url = `${address}:${normalConnectionPort}/receive-block-proposal`;
  const response = await got.post(url, {
    json: {
      blockProposal,
      toeplitzGroupSignature,
    },
  });
  return response;
};

export const sendDataProposal = async (
  nodeAddresses: NodeAddresses,
  dataProposal: string,
  toeplitzGroupSignature: string[]
) => {
  const { address, normalConnectionPort} = nodeAddresses;
  const url = `${address}:${normalConnectionPort}/receive-data-proposal`;
  const response = await got.post(url, {
    json: {
      dataProposal,
      toeplitzGroupSignature,
    },
  });
  return response;
};

export const checkIfOneTimePadIsEstablished = async (
  nodeAddresses: NodeAddresses,
  myNodeAddress: string
) => {
  const { address, quantumConnectionPort} = nodeAddresses;
  const url = `${address}:${quantumConnectionPort}/check-one-time-pad`;
  const response = await got.post(url, {
    json: {
      address: myNodeAddress,
    },
    responseType: 'json',
  });
  return response.body as { oneTimePad: number[] };
};

export const sendVerifyAndVote = async (
  nodeAddresses: NodeAddresses,
  peerQueue: NodeAddresses[],
  transactionHash: string,
) => {
  const { address, normalConnectionPort} = nodeAddresses;
  const url = `${address}:${normalConnectionPort}/verify-and-vote`;
  const response = await got.post(url, {
    json: {
      peerQueue,
      transactionHash,
    },
  });
  return response;
};

export const sendAddVote = async (nodeAddresses: NodeAddresses) => {
  const { address, normalConnectionPort} = nodeAddresses;
  const url = `${address}:${normalConnectionPort}/add-vote`;
  const response = await got.post(url);
  return response;
};

export const sendVotingFinished = async (nodeAddresses: NodeAddresses) => {
  const { address, normalConnectionPort} = nodeAddresses;
  const url = `${address}:${normalConnectionPort}/voting-finished`;
  const response = await got.post(url);
  return response;
};

export const getNodesAddressesFromBootstrap = async () => {
  const address = process.env.NODE_ADDRESS;
  const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
  const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;
  const bootstrapNodeAddress = process.env.BOOTSTRAP_NODE_ADDRESS;
  const url = `${bootstrapNodeAddress}/connected-nodes`;
  const response = await got.post(url, {
    json: { 
      address,
      normalConnectionPort,
      quantumConnectionPort
    },
    responseType: 'json'
  });
  return response.body as NodeAddresses[];
};
