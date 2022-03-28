import { log } from '../../shared/utils/log';
import { getQKDKey, getQKDKeyById, sendToeplitzVectorByQKD} from './http.service';
import { matrixMathService } from './matrixMath.service';
import { buildToeplitzService } from './toeplitz.service';
import { NodeService } from './node.service';

export const buildoneToeplitzByQKD = (nodeService: NodeService,	
	toeplitzService: ReturnType<typeof buildToeplitzService>) => {
	const { getContiguousNodesAddresses } = nodeService;
	const { convertStringToBinary } = matrixMathService();

	const establishToeplitzMatrixWithQKD = async (transactionLength: number) => {
		log('Establishing toeplitz matrix with peers using QKD');
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			const keyLength = 2 * transactionLength;
			const response = await getQKDKey(keyLength);
			const key = response?.key;
			const keyId = response?.keyId;
			if (key && keyId) {
				const keyAsBinary = convertStringToBinary(key);
				const toeplitzVector = keyAsBinary.slice(0,keyAsBinary.length -1);
				const toeplitzMatrix = matrixMathService().generateToeplitzMatrix(toeplitzVector);
				toeplitzService.addToeplitzMatrix(toeplitzMatrix, nodeAddress.address);	
				await sendToeplitzVectorByQKD(nodeAddress, keyId);
			}
		}
	};

	const fetchAndStoreToeplitzMatrix = async (keyId: string, nodeAddress: string) => {
		log('Fetching toeplitz vector');
		const response = await getQKDKeyById(keyId);
		const key = response?.key;
		if (key) {
			const keyAsBinary = convertStringToBinary(key);
			const toeplitzVector = keyAsBinary.slice(0,keyAsBinary.length -1);
			const toeplitzMatrix = matrixMathService().generateToeplitzMatrix(toeplitzVector);
			toeplitzService.addToeplitzMatrix(toeplitzMatrix, nodeAddress);	
		}
	};

	return {
		establishToeplitzMatrixWithQKD,
		fetchAndStoreToeplitzMatrix
	};
};
