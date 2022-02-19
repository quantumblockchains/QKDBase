import { Matrix, matrix, multiply, xor } from 'mathjs';
import { generateRandomBinaryArray } from '../utils/generateRandomBinaryArray';
import { checkIfToeplitzMatrixIsEstablished, sendTopelitzMatrix } from './http.service';
import { OneTimePadMapping } from './oneTimePad.service';
import { matrixMathService } from './matrixMath.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';
import { NodeAddress } from '../../shared/types';

export interface ToeplitzMatrixMapping {
  toeplitzMatrix: number[][];
  nodeAddress: string;
}

export const buildToeplitzService = (nodeService: NodeService) => {
	let teoplitzMatrixesMapping = [] as ToeplitzMatrixMapping[];
	let toeplitzGroupSignature = [] as string[];

	const { getContiguousNodesAddresses, getMyNodeAddresses } = nodeService;

	const {
		isToeplitzMatrix,
		compareToeplitzMatrixes,
		generateToeplitzMatrix,
		convertStringToBinary,
		calculateModuloFromMatrixElements,
	} = matrixMathService();

	const establishToeplitzMatrix = async (transactionLength: number) => {
		log('Establishing Toeplitz matrix with peers - transaction');
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		const myNodeAddress = getMyNodeAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			const { toeplitzMatrix } = await checkIfToeplitzMatrixIsEstablished(
				nodeAddress,
				myNodeAddress.address
			);
			const toeplitzMatrixFromMapping = getToeplitzMatrixFromMapping(nodeAddress.address);
			if (!!toeplitzMatrix && !compareToeplitzMatrixes(toeplitzMatrixFromMapping, toeplitzMatrix)) {
				throw Error('Non matching Toeplitz matrix');
			} else if (!toeplitzMatrix) {
				await generateAndSendToeplitzMatrix(transactionLength, nodeAddress);
			}
		}
		return teoplitzMatrixesMapping;
	};

	const getToeplitzMatrixFromMapping = (nodeAddress: string) => {
		const filteredToeplitzMapping = teoplitzMatrixesMapping.filter(
			(toeplitzMap) => toeplitzMap.nodeAddress === nodeAddress
		)[0];
		return filteredToeplitzMapping?.toeplitzMatrix;
	};

	const generateAndSendToeplitzMatrix = async (transactionLength: number, nodeAddress: NodeAddress) => {
		const seedSize = 2 * transactionLength - 1;
		const binaryArray = generateRandomBinaryArray(seedSize);
		const toeplitzMatrix = generateToeplitzMatrix(binaryArray);
		addToeplitzMatrix(toeplitzMatrix, nodeAddress.address);
		const myNodeAddress = getMyNodeAddresses();
		await sendTopelitzMatrix(nodeAddress, toeplitzMatrix, myNodeAddress.address);
	};

	const checkIfToeplitzMatrixExists = (nodeAddress: string) => {
		log('Checking if Toeplitz matrix exists');
		const toeplitzObjectFound = teoplitzMatrixesMapping.filter(
			(toeplitzMap) => toeplitzMap.nodeAddress === nodeAddress
		)[0];
		return toeplitzObjectFound?.toeplitzMatrix;
	};

	const computeToeplitzHash = (
		data: string,
		toeplitzMatrix: number[][],
		oneTimePad: number[]
	) => {
		const transactionDataAsBinary = convertStringToBinary(data);  
		const toeplitzParsedMatrix = matrix(toeplitzMatrix);
		const outputVector = multiply(toeplitzParsedMatrix, transactionDataAsBinary);
		const multipliedMatrixesModulo = calculateModuloFromMatrixElements(outputVector);
		const oneTimePadKeyAsMatrix = matrix(oneTimePad);
		const xorResult = xor(multipliedMatrixesModulo, oneTimePadKeyAsMatrix) as Matrix;
		const xorArray = xorResult.toArray();
		xorArray.forEach((element, index) => {xorArray[index] = element ? 1 : 0;});
		return xorArray.join('');
	};

	const calculateToeplitzHash = (
		oneTimePadMapping: OneTimePadMapping[],
		dataProposal: string,
	) => {
		log('Calculating Toeplitz Hash');
		const teoplitzMatrixesMapping = getToeplitzMapping();
		const { toeplitzMatrix } = teoplitzMatrixesMapping[0];
		const { oneTimePad } = oneTimePadMapping[0];
		return computeToeplitzHash(dataProposal, toeplitzMatrix, oneTimePad);
	};

	const generateToeplitzHash = (dataProposal: string) => {
		const dataAsBinary = convertStringToBinary(dataProposal);
		const seedSize = 2 * dataAsBinary.length - 1;
		const binaryArray = generateRandomBinaryArray(seedSize);
		const toeplitzMatrix = generateToeplitzMatrix(binaryArray);
		const oneTimePad = generateRandomBinaryArray(dataAsBinary.length);
		return computeToeplitzHash(dataProposal, toeplitzMatrix, oneTimePad);
	};

	const verifyToeplitzGroupSignature = (
		toeplitzGroupSignature: string[],
		toeplitzHash: string
	) => {
		log('Verifying data proposal signature');
		return toeplitzGroupSignature.some(hash => hash === toeplitzHash);
	};

	const addToeplitzMatrix = (toeplitzMatrix: number[][], nodeAddress: string) => {
		log('Adding established Toeplitz matrix');
		if (!isToeplitzMatrix(toeplitzMatrix)) {
			throw Error('Invalid Toeplitz matrix');
		}
		teoplitzMatrixesMapping.push({
			nodeAddress,
			toeplitzMatrix
		});
	};

	const getToeplitzMapping = () => teoplitzMatrixesMapping;

	const generateToeplitzGroupSignature = (
		oneTimePadMapping: OneTimePadMapping[],
		transaction: string
	) => {
		log('Generating Toeplitz Group Signature');
		const teoplitzMatrixesMapping = getToeplitzMapping();
		teoplitzMatrixesMapping.forEach((toeplitzMap) => {
			const oneTimeMap = oneTimePadMapping.filter(
				(map) => map.nodeAddress === toeplitzMap.nodeAddress
			)[0];
			const toeplitzHash = computeToeplitzHash(
				transaction,
				toeplitzMap.toeplitzMatrix,
				oneTimeMap.oneTimePad
			);
			addToeplitzHashToGroupSignature(toeplitzHash);
		});
		return toeplitzGroupSignature;
	};

	const addToeplitzHashToGroupSignature = (toeplitzHash: string) => {
		log('Adding Toeplitz Hash to Toeplitz Group Signature');
		toeplitzGroupSignature.push(toeplitzHash);
	};

	const storeToeplitzGroupSignature = (toeplitzHashesReceived: string[]) => {
		log('Storing Toeplitz Group Signature');
		toeplitzHashesReceived.forEach(toeplitzHash => toeplitzGroupSignature.push(toeplitzHash));
	};

	const getToeplitzGroupSignature = () => [...toeplitzGroupSignature];

	const clearToeplitzGroupSignature = () => {
		toeplitzGroupSignature = [];
	};

	const clearToeplitzMatrixesMapping = () => {
		teoplitzMatrixesMapping = [];
	};

	return {
		establishToeplitzMatrix,
		checkIfToeplitzMatrixExists,
		addToeplitzMatrix,
		getToeplitzMapping,
		calculateToeplitzHash,
		generateToeplitzHash,
		verifyToeplitzGroupSignature,
		generateToeplitzGroupSignature,
		addToeplitzHashToGroupSignature,
		storeToeplitzGroupSignature,
		getToeplitzGroupSignature,
		clearToeplitzGroupSignature,
		clearToeplitzMatrixesMapping,
	};
};
