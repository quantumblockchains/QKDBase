import { buildDataService } from '../../services/data.service';
import { nodeService } from '../../services/node.service';
import { server } from '../mock/http.service.mock';
jest.spyOn(nodeService, 'getContiguousNodesAddresses').mockImplementation(() => [{
	address: 'http://test-address',
	port: '1',
}]);


describe('Data service', () => {
	let dataService: ReturnType<typeof buildDataService>;
	beforeAll(() => dataService = buildDataService(nodeService));

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

	describe('sendDataProposalWithGroupSignatureToAllPeers', () => {
		beforeAll(() => server.listen());
		afterEach(() => server.resetHandlers());
		afterAll(() => server.close());

		test('Throw error if data proposal not set ', async () => {
			const testToeplitzGroupSignature = ['testToeplitzHash1', 'testToeplitzHash2', 'testToeplitzHash3'];
			const sendDataProposal = dataService
				.sendDataProposalWithGroupSignatureToAllPeers(testToeplitzGroupSignature);
			await expect(sendDataProposal).rejects.toThrowError('Empty data proposal');
		});

		test("Don't throw error if data proposal set and sent", async () => {
			dataService.setDataProposal('testValue');
			const testToeplitzGroupSignature = ['testToeplitzHash1', 'testToeplitzHash2', 'testToeplitzHash3'];
			const sendDataProposal = dataService
				.sendDataProposalWithGroupSignatureToAllPeers(testToeplitzGroupSignature);
			await expect(sendDataProposal).resolves.toBeUndefined();
		});
	});
});
