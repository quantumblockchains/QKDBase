import { nodeService } from '../../services/node.service';
import { buildVotingService } from '../../services/voting.service';
import { server } from '../mock/http.service.mock';
jest.spyOn(nodeService, 'getAllNodesAddresses').mockImplementation(() => [{
  address: 'http://testAddress',
  normalConnectionPort: '1',
  quantumConnectionPort: '2'
}]);

describe('Voting service', () => {
  let votingService: ReturnType<typeof buildVotingService>;
  beforeAll(() => {
    votingService = buildVotingService(nodeService);
  });
  beforeEach(() => votingService.clearVotes());

  describe('getVotes', () => {
    test('Default value is 0', () => {
      expect(votingService.getVotes()).toBe(0);
    });
  });

  describe('addVote', () => {
    test('Votes increment after adding vote', () => {
      votingService.addVote();
      expect(votingService.getVotes()).toBe(1);
    });

    test('Votes increment by 2 after adding vote second time', () => {
      votingService.addVote();
      votingService.addVote();
      expect(votingService.getVotes()).toBe(2);
    });
  });

  describe('clearVotes', () => {
    test('Votes should be 0 after clearing', () => {
      votingService.addVote();
      votingService.clearVotes();
      expect(votingService.getVotes()).toBe(0);
    });
  });

  describe('setIsVoteEnded', () => {
    test('Default value is false', () => {
      expect(votingService.getIsVoteEnded()).toBe(false);
    });

    test('Value is true after changing to true', () => {
      votingService.setIsVoteEnded(true);
      expect(votingService.getIsVoteEnded()).toBe(true);
    });
  });

  describe('verifyVote', () => {
    test('Return false if transaction hash is invalid', () => {
      const dataProposal = 'testDataProposal';
      const testToeplitzGroupSignature = ['testToeplitzHash1', 'testToeplitzHash2', 'testToeplitzHash3'];
      const transactionHash = 'invalidTransactionHash';
      const verification = votingService.verifyVote(dataProposal, testToeplitzGroupSignature, transactionHash);
      expect(verification).toBe(false);
    });

    test('Return true if transaction hash is valid', () => {
      const dataProposal = 'testDataProposal';
      const testToeplitzGroupSignature = ['testToeplitzHash1', 'testToeplitzHash2', 'testToeplitzHash3'];
      const transactionHash = 'cb5f67662f2ddc4eab325b88f705b0a5c643ab52f93e08098af74604ac36a7db';
      const verification = votingService.verifyVote(dataProposal, testToeplitzGroupSignature, transactionHash);
      expect(verification).toBe(true);
    });
  });

  describe('sendAddVoteAllPeers', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());

    test("Don't throw error", async () => {
      const sendAddVoteAllPeers = votingService.sendAddVoteAllPeers();
      await expect(sendAddVoteAllPeers).resolves.toBeUndefined();
    });
  });

  describe('sendVotingFinishedToAllPeers', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());

    test("Don't throw error", async () => {
      const sendVotingFinishedToAllPeers = votingService.sendAddVoteAllPeers();
      await expect(sendVotingFinishedToAllPeers).resolves.toBeUndefined();
    });
  });

  describe('initializeVote', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());

    test("Don't throw error", async () => {
      const peerQueue = [
        {
          address: 'http://testAddress',
          normalConnectionPort: '1',
          quantumConnectionPort: '2'
        },
        {
          address: 'http://testAddress1',
          normalConnectionPort: '1',
          quantumConnectionPort: '2'
        }
      ];
      const sendDataProposal = votingService.initializeVote(peerQueue, 'testTransactionHash');
      await expect(sendDataProposal).resolves.toBeUndefined();
    });
  });
});
