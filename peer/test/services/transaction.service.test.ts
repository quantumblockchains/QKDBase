import { nodeService } from '../../services/node.service';
import { buildTransactionService } from '../../services/transaction.service';

describe('Transaction service', () => {
	let transactionService: ReturnType<typeof buildTransactionService>;
	beforeAll(() => transactionService = buildTransactionService(nodeService));

	describe('storeTransactionHash', () => {
		const testStoreTransactionHash = (valueToStore: string) => {
			transactionService.storeTransactionHash(valueToStore);
			expect(transactionService.getTransactionHash()).toBe(valueToStore);
		};
    
		test('Transaction hash not stored', () => {
			expect(transactionService.getTransactionHash()).toBe(undefined);
		});

		test('Empty string', () => {
			testStoreTransactionHash('');
		});

		test('Non empty string', () => {
			testStoreTransactionHash('testValue');
		});
	});

	describe('clearTransactionHash', () => {
		test('Transaction hash set and cleared', () => {
			transactionService.storeTransactionHash('testValue');
			transactionService.clearTransactionHash();
			expect(transactionService.getTransactionHash()).toBe(undefined);
		});
	});

	describe('calculateTransactionHash', () => {
		const testCalculateTransactionHash = (dataProposal: string, toeplitzHash: string, valueExpected: string) => {
			const valueCalculated = transactionService.calculateTransactionHash(dataProposal, toeplitzHash);
			expect(valueCalculated).toBe(valueExpected);
		};

		test('Empty data proposal and teoplitz hash', () => {
			const valueExpected = 'd3e240ee4d41be180a84519a35dae379bf0891d12ad663afa04852ce386cbec3';
			testCalculateTransactionHash('', '', valueExpected);
		});

		test('Empty data proposal', () => {
			const valueExpected = '1c4e9db967d6e8b9ec6f5085697b45b5cd719988d1fd6a851b823494e7662bb0';
			testCalculateTransactionHash('testDataProposal', '', valueExpected);
		});

		test('Empty teoplitz hash', () => {
			const valueExpected = '57bf14ea665fd368b048ab63725f6a14f9ce1f9a268f2d6087e746e386aa82ca';
			testCalculateTransactionHash('', 'testToeplitzHas', valueExpected);
		});

		test('Non empty data proposal and teoplitz hash', () => {
			const valueExpected = '1fc97a4029b8d9afed45657f740f2c9a245e2a702f4a43509a713e59cf5814f7';
			testCalculateTransactionHash('testDataProposal', 'testToeplitzHas', valueExpected);
		});
	});
});