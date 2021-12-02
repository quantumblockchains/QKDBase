import { computeProposalHash } from '../utils/computeProposalHash';
import { sendVotingFinished, sendAddVote, sendVerifyAndVote } from './http.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';
import { NodeAddresses } from '../../shared/types';

export const buildVotingService = (nodeService: NodeService) => {
  let votes = 0;
  let isVoteEnded = false;

  const { getAllNodesAddresses } = nodeService;

  const initializeVote = async (peerQueue: NodeAddresses[], transactionHash: string) => {
    log('Initializing voting');
    try {
      const voter = peerQueue[0];
      await sendVerifyAndVote(voter, peerQueue.slice(1), transactionHash);
    } catch (error) {
      console.error(error)
      throw error;
    }
  };

  const verifyVote = (
    dataProposal: string,
    toeplitzGroupSignature: string[],
    transactionHash: string,
  ) => {
    log('Verifying vote');
    const allNodesAddresses = getAllNodesAddresses();
    return allNodesAddresses.some(nodeAddress => {
      const hashedTransactions = toeplitzGroupSignature
        .map(hash => computeProposalHash(hash, nodeAddress, dataProposal));
      return hashedTransactions.some(hash => transactionHash === hash);
    });
  };

  const addVote = () => {    
    log('Adding vote');
    votes = votes + 1;
  }

  const getVotes = () => votes;

  const sendAddVoteAllPeers = async () => {
    log('Sending verified vote to all peers');
    const allNodesAddresses = getAllNodesAddresses();
    for (const nodeAddress of allNodesAddresses) {
      await sendAddVote(nodeAddress);
    }
  };

  const sendVotingFinishedToAllPeers = async () => {
    log('Sending request to finish voting');
    const allNodesAddresses = getAllNodesAddresses();
    for (const nodeAddress of allNodesAddresses) {
      await sendVotingFinished(nodeAddress);
    }
  }

  const clearVotes = () => {
    votes = 0;
  };

  const setIsVoteEnded = (value: boolean) => {
    isVoteEnded = value;
  };

  const getIsVoteEnded = () => isVoteEnded;

  return {
    initializeVote,
    addVote,
    getVotes,
    verifyVote,
    sendAddVoteAllPeers,
    sendVotingFinishedToAllPeers,
    clearVotes,
    setIsVoteEnded,
    getIsVoteEnded,
  };
};
