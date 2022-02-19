import got from 'got';
import { NodeAddress } from '../shared/types';

export const connectedNodesService = () => {
	const connectedNodes: NodeAddress[] = [];

	const addNode = (nodeAddress: NodeAddress) => connectedNodes.push(nodeAddress);

	const getConnectedNodes = () => [...connectedNodes];

	const sendAddNodeAddressToAll = async (nodeAddress: NodeAddress) => {
		for (const node of connectedNodes) {
			const url = `${node.address}:${node.port}/add-node`;
			await got.post(url, {
				json: {
					nodeAddress
				},
			});
		}
	};

	return {
		addNode,
		getConnectedNodes,
		sendAddNodeAddressToAll
	};
};
