import { Matrix, matrix, multiply, xor } from 'mathjs';
import { generateRandomBinaryArray } from '../utils/generateRandomBinaryArray';
import { 
	checkIfToeplitzMatrixIsEstablished,
	sendToeplitzGroupSignature,
	sendTopelitzMatrix
} from './http.service';
import { OneTimePadMapping } from './oneTimePad.service';
import { matrixMathService } from './matrixMath.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';
import { NodeAddress } from '../../shared/types';
import { computeHashedSignature } from '../utils/computeHashedSignature';

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
		toeplitzMatrixToVector,
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
		const toeplitzVector = toeplitzMatrixToVector(toeplitzMatrix);
		await sendTopelitzMatrix(nodeAddress, toeplitzVector, myNodeAddress.address);
	};

	const checkIfToeplitzMatrixExists = (nodeAddress: string) => {
		log('Checking if Toeplitz matrix exists');
		const toeplitzObjectFound = teoplitzMatrixesMapping.filter(
			(toeplitzMap) => toeplitzMap.nodeAddress === nodeAddress
		)[0];
		return toeplitzObjectFound?.toeplitzMatrix;
	};

	const computeToeplitzSignature = (
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

	const calculateHashedSignature = (
		oneTimePadMapping: OneTimePadMapping[],
		dataProposal: string,
	) => {
		log('Calculating Toeplitz Hash');
		const teoplitzMatrixesMapping = getToeplitzMapping();
		const { toeplitzMatrix } = teoplitzMatrixesMapping[0];
		const { oneTimePad } = oneTimePadMapping[0];
		const toeplitzSignature = computeToeplitzSignature(dataProposal, toeplitzMatrix, oneTimePad);
		const { address } = getMyNodeAddresses();
		return computeHashedSignature(toeplitzSignature, address);
	};

	const generateHashedSignature = (dataProposal: string) => {
		const dataAsBinary = convertStringToBinary(dataProposal);
		const seedSize = 2 * dataAsBinary.length - 1;
		const binaryArray = generateRandomBinaryArray(seedSize);
		const toeplitzMatrix = generateToeplitzMatrix(binaryArray);
		const oneTimePad = generateRandomBinaryArray(dataAsBinary.length);
		const toeplitzSignature = computeToeplitzSignature(dataProposal, toeplitzMatrix, oneTimePad);
		const { address } = getMyNodeAddresses();
		return computeHashedSignature(toeplitzSignature, address);
	};

	const verifyToeplitzGroupSignature = (
		toeplitzGroupSignature: string[],
		toeplitzSignature: string
	) => {
		log('Verifying data proposal signature');
		return toeplitzGroupSignature.some(signature => signature === toeplitzSignature);
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
			const toeplitzSignature = computeToeplitzSignature(
				transaction,
				toeplitzMap.toeplitzMatrix,
				oneTimeMap.oneTimePad
			);
			const hashedSignature = computeHashedSignature(toeplitzSignature, toeplitzMap.nodeAddress);
			addHashedSignatureToGroupSignature(hashedSignature);
		});
		return toeplitzGroupSignature;
	};

	const sendToeplitzGroupSignatureToAllPeers = async (toeplitzGroupSignature: string[]) => {
		log('Sending Toeplitz Group Signature to peers');
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			if (!toeplitzGroupSignature) {
				throw Error('No Toeplitz Group Signature');
			} else {
				await sendToeplitzGroupSignature(nodeAddress, toeplitzGroupSignature);
			}
		}
	};

	const addHashedSignatureToGroupSignature = (toeplitzSignature: string) => {
		log('Adding Toeplitz Hash to Toeplitz Group Signature');
		toeplitzGroupSignature.push(toeplitzSignature);
	};

	const storeToeplitzGroupSignature = (toeplitzSignatureesReceived: string[]) => {
		log('Storing Toeplitz Group Signature');
		toeplitzSignatureesReceived.forEach(toeplitzSignature => toeplitzGroupSignature.push(toeplitzSignature));
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
		calculateHashedSignature,
		generateHashedSignature,
		verifyToeplitzGroupSignature,
		generateToeplitzGroupSignature,
		addHashedSignatureToGroupSignature,
		storeToeplitzGroupSignature,
		sendToeplitzGroupSignatureToAllPeers,
		getToeplitzGroupSignature,
		clearToeplitzGroupSignature,
		clearToeplitzMatrixesMapping,
	};
};
