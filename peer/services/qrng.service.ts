import { getQRNGRandomArray } from './http.service';
import { NodeService } from './node.service';

export const buildQRNGService = (nodeService: NodeService) => {

	const { getAllNodesAddresses } = nodeService;

	const generateRandomArrayOfNodes = async () => {
		const randomArray = await getQRNGRandomArray({ length: 15, min: 0, max: 3 });
		const uniqueRandomArray = Array.from(new Set(randomArray));
		if (uniqueRandomArray.length !== 4) {
			await generateRandomArrayOfNodes();
		}
		const allNodes = getAllNodesAddresses();
		return uniqueRandomArray.map(index => allNodes[index]);
	};


	return {
		generateRandomArrayOfNodes
	};
};
