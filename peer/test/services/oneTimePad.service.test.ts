import { buildOneTimePadService } from '../../services/oneTimePad.service';
import { nodeService } from '../../services/node.service';
import * as httpService from '../../services/http.service';
import { server } from '../mock/http.service.mock';
jest.spyOn(nodeService, 'getContiguousNodesAddresses');
const sendOneTimePad = jest.spyOn(httpService, 'sendOneTimePad');

describe('One-time pad service', () => {
	let oneTimePadService: ReturnType<typeof buildOneTimePadService>;
	beforeAll(() => oneTimePadService = buildOneTimePadService(nodeService));
	beforeEach(() => oneTimePadService.clearOneTimePads());

	describe('addOneTimePad', () => {
		test('Add one-time key to mapping if unique', () => {
			const oneTimePad = [1,2,3,4,5];
			oneTimePadService.addOneTimePad(oneTimePad, 'test-address');
			const oneTimePadReceived = oneTimePadService.getOneTimePadFromMapping('test-address');
			expect(oneTimePadReceived).toBe(oneTimePad);
		});

		test("Don't add one-time key to mapping if not unique", () => {
			const oneTimePad = [1,2,3,4,5];
			oneTimePadService.addOneTimePad(oneTimePad, 'test-address');
			oneTimePadService.addOneTimePad(oneTimePad, 'test-address');
			const oneTimePadMappingLength = oneTimePadService.getOneTimePadMapping().length;
			expect(oneTimePadMappingLength).toBe(1);
		});
	});

	describe('clearOneTimePads', () => {
		test('One-time pad mapping is empty after adding and clearing', () => {
			const oneTimePad = [1,2,3,4,5];
			oneTimePadService.addOneTimePad(oneTimePad, 'test-address');
			oneTimePadService.clearOneTimePads();
			const oneTimePadReceived = oneTimePadService.getOneTimePadFromMapping('test-address');
			expect(oneTimePadReceived).toBeUndefined();
		});
	});

	describe('establishOneTimePad', () => {
		beforeAll(() => server.listen());
		beforeEach(() => {
			oneTimePadService.clearOneTimePads();
			sendOneTimePad.mockClear();
		});
		afterAll(() => server.close());

		const mockContiguousNodes = (isCorrect: boolean) => {
			jest.spyOn(nodeService, 'getContiguousNodesAddresses').mockImplementationOnce(() => [
				{
					address: isCorrect ? 'http://test-address' : 'http://wrong-address',
					port: '1',
				},
			]);
		};

		test('Return one-time pad mapping if one-time key generated', async () => {
			mockContiguousNodes(false);
			const oneTimePadMapping = await oneTimePadService.establishOneTimePad(5);
			expect(oneTimePadMapping[0].nodeAddress).toEqual('http://wrong-address');
			expect(sendOneTimePad).toBeCalledTimes(1);
		});


		test('Return one-time pad mapping if one-time already stored', async () => {
			mockContiguousNodes(false);
			const oneTimePad = [1,2,3,4,5];
			oneTimePadService.addOneTimePad(oneTimePad, 'http://wrong-address');
			const oneTimePadMapping = await oneTimePadService.establishOneTimePad(5);
			expect(oneTimePadMapping).toEqual([{
				nodeAddress: 'http://wrong-address',
				oneTimePad
			}]);
			expect(sendOneTimePad).toBeCalledWith({
				address: 'http://wrong-address',
				port: '1',
			}, [1,2,3,4,5], 'http://localhost');
		});
    
		test('Return one-time pad mapping if one-time key received', async () => {
			mockContiguousNodes(true);
			const oneTimePadMapping = await oneTimePadService.establishOneTimePad(5);
			expect(oneTimePadMapping).toEqual([{
				nodeAddress: 'http://test-address',
				oneTimePad: [1,1,0,1,0]
			}]);
		});
    
		test('Throw error if one-time key received and al', async () => {
			mockContiguousNodes(true);
			const oneTimePad = [1,2,3,4,5];
			oneTimePadService.addOneTimePad(oneTimePad, 'http://test-address');
			const establishOneTimePad = oneTimePadService.establishOneTimePad(5);
			expect(establishOneTimePad).rejects.toThrowError('Non matching one time pad');
		});
	});
});
