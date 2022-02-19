import { buildToeplitzService } from '../../services/toeplitz.service';
import { nodeService } from '../../services/node.service';
import { matrixMathService } from '../../services/matrixMath.service';
import { generateRandomBinaryArray } from '../../utils/generateRandomBinaryArray';
import { OneTimePadMapping } from '../../services/oneTimePad.service';
import { server } from '../mock/http.service.mock';

const mockContiguousNodes = (hasMatrix: boolean) => {
	jest.spyOn(nodeService, 'getContiguousNodesAddresses').mockImplementation(() => [
		{
			address: hasMatrix ? 'http://testaddressFirst' : 'http://testaddressSecond',
			port: '1',
		},
	]);
};

describe('Topelitz service', () => {
	let toeplitzService: ReturnType<typeof buildToeplitzService>;
	mockContiguousNodes(true);
	beforeAll(() => {
		toeplitzService = buildToeplitzService(nodeService);
	});
	beforeEach(() => {
		toeplitzService.clearToeplitzGroupSignature();
		toeplitzService.clearToeplitzMatrixesMapping();
	});

	describe('clearToeplitzGroupSignature', () => {
		test('Clear empty signature', () => {
			toeplitzService.clearToeplitzGroupSignature();
			expect(toeplitzService.getToeplitzGroupSignature()).toEqual([]);
		});
		test('Clear existing signature', () => {
			const testArray = ['testValue0', 'testValue1', 'testValue2'];
			toeplitzService.storeToeplitzGroupSignature(testArray);
			toeplitzService.clearToeplitzGroupSignature();
			expect(toeplitzService.getToeplitzGroupSignature()).toEqual([]);
		});
	});

	describe('clearToeplitzMatrixMapping', () => {
		test('Clear empty Toeplitz Matrix Mapping', () => {
			toeplitzService.clearToeplitzMatrixesMapping();
			expect(toeplitzService.getToeplitzMapping()).toBeUndefined;
		});
		test('Clear existing Toeplitz Matrix Mapping containing 1 entry', () => {
			const binaryString = generateRandomBinaryArray(11);
			const toelpitzMatrix = matrixMathService().generateToeplitzMatrix(binaryString);
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'mockaddress'); 
			toeplitzService.clearToeplitzMatrixesMapping();
			expect(toeplitzService.getToeplitzMapping()).toBeUndefined;
		});
		test('Clear existing Toeplitz Matrix Mapping containing few entries', () => {
			const binaryString = generateRandomBinaryArray(11);
			const toelpitzMatrix = matrixMathService().generateToeplitzMatrix(binaryString);
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'mockaddress1');
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'mockaddress2'); 
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'mockaddress3');
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'mockaddress4');   
			toeplitzService.clearToeplitzMatrixesMapping();
			expect(toeplitzService.getToeplitzMapping()).toBeUndefined;
		});
	});

	describe('addToeplitzHashToGroupSignature', () => {
		test('Add string to empty ToeplitzHashGroupSignature', () => {
			toeplitzService.addToeplitzHashToGroupSignature('testValue');
			expect(toeplitzService.getToeplitzGroupSignature()[0]).toBe('testValue');
		});
		test('Add string to non-empty ToeplitzHashGroupSignature', () => {
			toeplitzService.clearToeplitzGroupSignature();
			const testArray = ['testValue0', 'testValue1'];
			toeplitzService.addToeplitzHashToGroupSignature(testArray[0]);
			toeplitzService.addToeplitzHashToGroupSignature(testArray[1]);
			expect(toeplitzService.getToeplitzGroupSignature()).toEqual(testArray);
		});
	});
    
	describe('storeToeplitzGroupSignature', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzGroupSignature();
		});
		test('Store array of strings in empty ToplitzGroupSignature array', () => {
			const testArray = ['testValue0', 'testValue1', 'testValue2'];
			toeplitzService.storeToeplitzGroupSignature(testArray);
			expect(toeplitzService.getToeplitzGroupSignature()).toEqual(testArray);
		});
		test('Add array of strings to non-empty ToplitzGroupSignature array', () => {
			const testArray = ['testValue0', 'testValue1', 'testValue2'];
			toeplitzService.storeToeplitzGroupSignature(testArray);
			toeplitzService.storeToeplitzGroupSignature(['testValue3']);
			const compareArray = ['testValue0', 'testValue1', 'testValue2','testValue3'];
			expect(toeplitzService.getToeplitzGroupSignature()).toEqual(compareArray);
		});
	});

	describe('addEstablishedToeplitzMatrix', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		test('Add Toeplitz Matrix to empty mapping', () => {
			const binaryString = generateRandomBinaryArray(11);
			const toelpitzMatrix = matrixMathService().generateToeplitzMatrix(binaryString);
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'address1'); 
			const retrievedToeplitMatrix = toeplitzService.getToeplitzMapping()[0].toeplitzMatrix;
			expect(retrievedToeplitMatrix).toEqual(toelpitzMatrix);   
		});
		test('Add Toeplitz Matrix to non-empty mapping', () => {
			const binaryString = generateRandomBinaryArray(11);
			const toelpitzMatrix = matrixMathService().generateToeplitzMatrix(binaryString);
			toeplitzService.addToeplitzMatrix(toelpitzMatrix, 'address1'); 
			const binaryString2 = generateRandomBinaryArray(5);
			const toelpitzMatrix2 = matrixMathService().generateToeplitzMatrix(binaryString2);
			toeplitzService.addToeplitzMatrix(toelpitzMatrix2, 'address2'); 
			const mapping = toeplitzService.getToeplitzMapping();
			const retrievedToeplitMatrix = mapping[mapping.length - 1].toeplitzMatrix;
			expect(retrievedToeplitMatrix).toEqual(toelpitzMatrix2);   
		});
	});

	describe('establishToeplitzMatrix', () => {
		beforeAll(() => {
			server.listen();
		});
		beforeEach(() => {
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		afterAll(() => server.close());
		test('Non empty transaction. Matrix established', async () => {
			mockContiguousNodes(true);
			const node = nodeService.getContiguousNodesAddresses();
			const transactionLength = 3;
			const toelpitzMatrixTest = [[1,0,1],[1,1,0],[0,1,1]];
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest, node[0].address); 
			const teoplitzMatrixesMapping = await toeplitzService.establishToeplitzMatrix(transactionLength);
			const retriveNodeEntries = teoplitzMatrixesMapping.filter(map => map.nodeAddress === node[0].address);
			const toeplitzMatrix = retriveNodeEntries[0].toeplitzMatrix;
			expect(toeplitzMatrix).toEqual(toelpitzMatrixTest);
		});
		test('Wrong tansacation length should not result in error if Toeplitz matrix is established', async () => {
			mockContiguousNodes(true);
			const node = nodeService.getContiguousNodesAddresses();
			const transactionLength = 4;
			const toelpitzMatrixTest = [[1,0,1],[1,1,0],[0,1,1]];
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest, node[0].address); 
			const teoplitzMatrixesMapping = await toeplitzService.establishToeplitzMatrix(transactionLength);
			const retriveNodeEntries = teoplitzMatrixesMapping.filter(map => map.nodeAddress === node[0].address);
			const toeplitzMatrix = retriveNodeEntries[0].toeplitzMatrix;
			expect(toeplitzMatrix).toEqual(toelpitzMatrixTest);
		});
		test('Matrix not established. Empty transaction should result in error', async () => {
			mockContiguousNodes(false);
			const transactionLength = 0;
			expect(async () => {
				await toeplitzService.establishToeplitzMatrix(transactionLength);
			}).rejects.toThrow();
		});
		test('Non-empty transaction. Matrix not established', async () => {
			mockContiguousNodes(false);
			const node = nodeService.getContiguousNodesAddresses();
			const transactionLength = 6;
			const teoplitzMatrixesMapping = await toeplitzService.establishToeplitzMatrix(transactionLength);
			const retriveNodeEntries = teoplitzMatrixesMapping.filter(map => map.nodeAddress === node[0].address);
			const toeplitzMatrix = retriveNodeEntries[0].toeplitzMatrix;
			expect(toeplitzMatrix.length).toEqual(6);
		});
		test('Matrix assigned to non existing node should result in throwing an error.', async () => {
			mockContiguousNodes(true);
			const transactionLength = 3;
			const toelpitzMatrixTest = [[1,0,1],[1,1,0],[0,1,1]];
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest, 'non_existing_address');
			expect( async () => {
				await toeplitzService.establishToeplitzMatrix(transactionLength);
			}).rejects.toThrow(); 
            
		});
	});

	describe('calculateToeplitzHash', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		test('Calculate Toeplitz Hash for single char', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0,1];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			const transaction = 'a';
			const hash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, transaction);
			expect(hash).toBe("10100010");
		});
		test('Empty string should result in error', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			expect( async () => {
				toeplitzService.calculateToeplitzHash(oneTimePadMapping, '');    
			}).rejects.toThrow();
		});
	});

	describe('generateToeplitzGroupSignature', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzGroupSignature();
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		test('Generate Signature for single char', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0,1];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1,1,0]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			const transaction = 'a';
			const toeplitzGS = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
			expect(toeplitzGS).toStrictEqual(["10100011"]);
		});
		test('Generate Signature for single empty string', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			const transaction = '';
			expect( async () => {
				await toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
			}).rejects.toThrow();
		});
		test('Generate Signature for empty mapping', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			const transaction = '';
			expect( async () => {
				toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
			}).rejects.toThrow();
		});
		test('One time pad has wrong length', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');    
			const transaction = 'a';
			expect( async () => {
				toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
			}).rejects.toThrow();
		});
	});
    
	describe('generateToeplitzHash', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		test('Generate Toeplitz Hash', () => {
			const transaction = 'a';
			const hash = toeplitzService.generateToeplitzHash(transaction);
			expect(hash.length).toBe(8);
		});
		test('Generate Toeplitz Hash for empty transaction', () => {
			const transaction = '';
			expect( async () => {
				toeplitzService.generateToeplitzHash(transaction);
			}).rejects.toThrow;
		});
	});

	describe('verifyToeplitzGroupSignature', () => {
		beforeEach(() => {
			toeplitzService.clearToeplitzGroupSignature();
			toeplitzService.clearToeplitzMatrixesMapping();
		});
		test('Verify Toeplitz Group Signature for single char transaction', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0,1];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const transaction = 'a';
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,1,1,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');
			const hash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, transaction);    
			const toeplitzGS = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transaction);
			const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGS, hash);
			expect(isVerified).toBe(true);
		});
		test('Verify Toeplitz Group Signature for two different transactions', () => {
			const oneTimePadMapping = [] as OneTimePadMapping[];
			const oneTimePad = [0,1,1,0,0,1,0,1];
			oneTimePadMapping.push({
				nodeAddress: 'mockAddress',
				oneTimePad
			});
			const transactionOne = 'a';
			const transactionTwo = 'b';
			const toelpitzMatrixTest = matrixMathService().generateToeplitzMatrix([0,0,1,0,1,1,1,0,1,0,1,1,0,0,1]);  
			toeplitzService.addToeplitzMatrix(toelpitzMatrixTest,'mockAddress');
			const hash = toeplitzService.calculateToeplitzHash(oneTimePadMapping, transactionOne);    
			const toeplitzGS = toeplitzService.generateToeplitzGroupSignature(oneTimePadMapping, transactionTwo);
			const isVerified = toeplitzService.verifyToeplitzGroupSignature(toeplitzGS, hash);
			expect(isVerified).toBe(false);
		});
	});
});