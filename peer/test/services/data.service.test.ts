
import { buildDataService } from '../../services/data.service';
import { nodeService } from '../../services/node.service';
import { server } from '../mock/http.service.mock';
jest.spyOn(nodeService, 'getContiguousNodesAddresses').mockImplementation(() => [{
  address: 'http://testAddress',
  normalConnectionPort: '1',
  quantumConnectionPort: '2'
}]);


describe('Data service', () => {
  let dataService: ReturnType<typeof buildDataService>;
  beforeAll(() => {
    dataService = buildDataService(nodeService);
  });

  describe('setDataProposal', () => {
    test('Set data proposal if data proposal not set', () => {
      dataService.setDataProposal('testValue');
      expect(dataService.getDataProposal()).toBe('testValue');
    });

    test('Throw error if data proposal already set and new data proposal is different', () => {
      dataService.setDataProposal('testValue');
      const setInvalidDataProposal = () => dataService.setDataProposal('InvalidTestValue');
      expect(setInvalidDataProposal).toThrowError('Invalid data proposal');
    });

    test('Set data proposal if data proposal already set and new data proposal is the same', () => {
      dataService.setDataProposal('testValue');
      dataService.setDataProposal('testValue');
      expect(dataService.getDataProposal()).toBe('testValue');
    });
  });

  describe('clearDataProposal', () => {
    test('Throw error if data proposal cleared and trying to get it', () => {
      dataService.setDataProposal('testValue');
      dataService.clearDataProposal();
      const getDataProposal = () => dataService.getDataProposal();
      expect(getDataProposal).toThrowError('Empty data proposal');
    });
  });

  describe('sendDataProposalToAllPeers', () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    test('Throw error if data proposal not set ', async () => {
      const testToeplitzGroupSignature = ['test1', 'test2', 'test3'];
      const sendDataProposal = dataService.sendDataProposalToAllPeers(testToeplitzGroupSignature);
      await expect(sendDataProposal).rejects.toThrowError('Empty data proposal');
    });

    test("Don't throw error if data proposal set and sent", async () => {
      dataService.setDataProposal('testValue');
      const testToeplitzGroupSignature = ['test1', 'test2', 'test3'];
      const sendDataProposal = dataService.sendDataProposalToAllPeers(testToeplitzGroupSignature);
      await expect(sendDataProposal).resolves.toBeUndefined();
    });
  });
});
