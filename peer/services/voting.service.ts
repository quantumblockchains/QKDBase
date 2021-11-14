import { computeProposalHash } from '../utils/computeProposalHash';
import { sendVotingFinished, sendAddVote, sendVerifyAndVote } from './http.service';
import { nodeService } from './node.service';
import { log } from '../utils/log';

export const votingService = (() => {
  let votes = 0;
  let isVoteEnded = false;

  const { getAllNodesHashes } = nodeService;
  const allNodesHashes = getAllNodesHashes();

  const initializeVote = async (peerQueue: string[], transactionHash: string) => {
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
    return allNodesHashes.some(nodeHash => {
      const hashedTransactions = toeplitzGroupSignature.map(hash => computeProposalHash(hash, nodeHash, dataProposal));
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
    for (const nodeHash of allNodesHashes) {
      await sendAddVote(nodeHash);
    }
  };

  const sendVotingFinishedToAllPeers = async () => {
    log('Sending request to finish voting');
    for (const nodeHash of allNodesHashes) {
      await sendVotingFinished(nodeHash);
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
})();
