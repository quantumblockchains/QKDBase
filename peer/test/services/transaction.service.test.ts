import { nodeService } from '../../services/node.service';
import { buildTransactionService } from '../../services/transaction.service';

describe('Transaction service', () => {
	let transactionService: ReturnType<typeof buildTransactionService>;
	beforeAll(() => transactionService = buildTransactionService(nodeService));

	describe('storeHashedSignature', () => {
		const testStoreHashedSignature = (valueToStore: string) => {
			transactionService.storeHashedSignature(valueToStore);
			expect(transactionService.getHashedSignature()).toBe(valueToStore);
		};
    
		test('Transaction hash not stored', () => {
			expect(transactionService.getHashedSignature()).toBe(undefined);
		});

		test('Empty string', () => {
			testStoreHashedSignature('');
		});

		test('Non empty string', () => {
			testStoreHashedSignature('testValue');
		});
	});

	describe('clearHashedSignature', () => {
		test('Transaction hash set and cleared', () => {
			transactionService.storeHashedSignature('testValue');
			transactionService.clearHashedSignature();
			expect(transactionService.getHashedSignature()).toBe(undefined);
		});
	});

	describe('calculateHashedSignature', () => {
		const testCalculateHashedSignature = (
			toeplitzSignature: string,
			valueExpected: string
		) => {
			const valueCalculated = transactionService.calculateHashedSignature(toeplitzSignature);
			expect(valueCalculated).toBe(valueExpected);
		};

		test('Empty data proposal', () => {
			const valueExpected = 'e0d47519a9255b402f60d372607663e65708174d801754b5f49bad3ee1c80f29';
			testCalculateHashedSignature('', valueExpected);
		});

		test('Non empty data proposal and teoplitz hash', () => {
			const valueExpected = '4a712e162c377a33c15adba13ea904a022ad11e8b0d4c7c550af2e8c69be12c2';
			testCalculateHashedSignature( 'testToeplitzHas', valueExpected);
		});
	});
});