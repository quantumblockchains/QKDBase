import { nodeService } from '../../services/node.service';
import { computeProposalHash } from '../../utils/computeProposalHash';

describe('computeProposalHash', () => {
  const testComputeProposalHash = (teoplitzHash: string, transaction: string, valueExpected: string) => {
    const { getMyNodeAddresses } = nodeService;
    const myNodeAddress = getMyNodeAddresses();
    const valueCalculated = computeProposalHash(teoplitzHash, myNodeAddress, transaction);
    expect(valueCalculated).toBe(valueExpected);
  };

  test('Empty toeplitz hash and transaction', () => {
    const valueExpected = 'd3e240ee4d41be180a84519a35dae379bf0891d12ad663afa04852ce386cbec3';
    testComputeProposalHash('', '', valueExpected);
  });

  test('Empty toeplitz hash', () => {
    const valueExpected = '922917b5cad6ecf12912eaddef72bcaadedee847588d9439defd033697491813';
    testComputeProposalHash('', 'testTransaction', valueExpected);
  });

  test('Empty transaction', () => {
    const valueExpected = '626ffe53966b7ad7bb4d6bfca2ab75235890b047b9daf6d58a8921dbfcc24a56';
    testComputeProposalHash('testToeplitzhash', '', valueExpected);
  });

  test('Non empty toeplitz hash and non empty transaction', () => {
    const valueExpected = 'df0f304f405e292d31c04bd41b58b68607cee8482aba86e14bd8cb81ebd5b219';
    testComputeProposalHash('testToeplitzhash', 'testTransaction', valueExpected);
  });
});
