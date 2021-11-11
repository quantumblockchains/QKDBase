import got, { Response } from 'got';
import { Block } from '../types';

export const checkIfToeplitzMatrixIsEstablished = async (
  nodeHash: string,
  myNodeHash: string
) => {
  const url = `http://${nodeHash}:3017/check-toeplitz`;
  const response = await got.post(url, {
    json: {
      nodeHash: myNodeHash,
    },
    responseType: 'json',
  });
  return response as Response<{ toeplitzMatrix: number[][] }>;
};

export const sendTopelitzMatrix = async (
  nodeHash: string,
  toeplitzMatrix: number[][],
  myNodeHash: string
) => {
  const url = `http://${nodeHash}:3017/receive-toeplitz`;
  const response = await got.post(url, {
    json: {
      toeplitzMatrix,
      nodeHash: myNodeHash,
    },
  });
  return response;
};

export const sendOneTimePad = async (
  nodeHash: string,
  oneTimePad: number[],
  myNodeHash: string
) => {
    const url = `http://${nodeHash}:3017/receive-one-time-pad`;
  const response = await got.post(url, {
    json: {
      oneTimePad,
      nodeHash: myNodeHash,
    },
  });
  return response;
};

export const sendBlockProposal = async (
  nodeHash: string,
  blockProposal: Block,
  toeplitzGroupSignature: string[]
) => {
  const url = `http://${nodeHash}:3016/receive-block-proposal`;
  const response = await got.post(url, {
    json: {
      blockProposal,
      toeplitzGroupSignature,
    },
  });
  return response;
};

export const checkIfOneTimePadIsEstablished = async (
  nodeHash: string,
  myNodeHash: string
) => {
  const url = `http://${nodeHash}:3017/check-one-time-pad`;
  const response = await got.post(url, {
    json: {
      nodeHash: myNodeHash,
    },
    responseType: 'json',
  });
  return response as Response<{ oneTimePad: number[] }>;
};

export const sendVerifyAndVote = async (
  nodeHash: string,
  peerQueue: string[],
  transactionHash: string,
) => {
  const url = `http://${nodeHash}:3016/verify-and-vote`;
  const response = await got.post(url, {
    json: {
      peerQueue,
      transactionHash,
    },
  });
  return response;
};

export const sendAddVote = async (nodeHash: string) => {
  const url = `http://${nodeHash}:3016/add-vote`;
  const response = await got.post(url);
  return response;
};

export const sendAddBlockToChain = async (nodeHash: string) => {
  const url = `http://${nodeHash}:3016/add-block-to-chain`;
  const response = await got.post(url);
  return response;
};
