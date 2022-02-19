import { log } from '../../shared/utils/log';
import { getQKDKey, getQKDKeyById, sendQKDKeyId } from './http.service';
import { matrixMathService } from './matrixMath.service';
import { NodeService } from './node.service';
import { OneTimePadService } from './oneTimePad.service';

export const buildQKDService = (nodeService: NodeService, oneTimePadService: OneTimePadService) => {
	const { getContiguousNodesAddresses } = nodeService;
	const { convertStringToBinary } = matrixMathService();

	const establishOneTimePadWithQKD = async (transactionLength: number) => {
		log('Establishing one time pad with peers using QKD');
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			const response = await getQKDKey(transactionLength);
			const key = response?.key;
			const keyId = response?.keyId;
			if (key && keyId) {
				const keyAsBinary = convertStringToBinary(key);
				oneTimePadService.addOneTimePad(keyAsBinary, nodeAddress.address);
				await sendQKDKeyId(nodeAddress, keyId);
			}
		}
	};

	const fetchAndStoreQKDKey = async (keyId: string, nodeAddress: string) => {
		log('Fetching QKD key');
		const response = await getQKDKeyById(keyId);
		const key = response?.key;
		if (key) {
			const keyAsBinary = convertStringToBinary(key);
			oneTimePadService.addOneTimePad(keyAsBinary, nodeAddress);
		}
	};

	return {
		establishOneTimePadWithQKD,
		fetchAndStoreQKDKey
	};
};
