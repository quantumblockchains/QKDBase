import { nodeService } from '../../services/node.service';
import { computeHashedSignature } from '../../utils/computeHashedSignature';

describe('computeHashedSignature', () => {
	const testComputeProposalHash = (toeplitzSignature: string, valueExpected: string) => {
		const { getMyNodeAddresses } = nodeService;
		const myNodeAddress = getMyNodeAddresses();
		const valueCalculated = computeHashedSignature(toeplitzSignature, myNodeAddress.address);
		expect(valueCalculated).toBe(valueExpected);
	};

	test('Empty toeplitz hash and transaction', () => {
		const valueExpected = 'e0d47519a9255b402f60d372607663e65708174d801754b5f49bad3ee1c80f29';
		testComputeProposalHash('', valueExpected);
	});

	test('Empty toeplitz hash', () => {
		const valueExpected = 'e0d47519a9255b402f60d372607663e65708174d801754b5f49bad3ee1c80f29';
		testComputeProposalHash('', valueExpected);
	});

	test('Empty transaction', () => {
		const valueExpected = '888f75483f746860000ae97973a11c44336c79fbc95062c00c581d6ec302b153';
		testComputeProposalHash('testToeplitzhash', valueExpected);
	});

	test('Non empty toeplitz hash and non empty transaction', () => {
		const valueExpected = '888f75483f746860000ae97973a11c44336c79fbc95062c00c581d6ec302b153';
		testComputeProposalHash('testToeplitzhash', valueExpected);
	});
});
