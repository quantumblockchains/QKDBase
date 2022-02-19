import dotenv from 'dotenv';
import { getNodesAddressesFromBootstrap } from './http.service';
import { compareNodeAddresses } from '../utils/compareNodeAddresses';
import { NodeAddress } from '../../shared/types';
dotenv.config();

export const nodeService = (() => {
	let nodes = [{
		address: process.env.NODE_ADDRESS,
		port: process.env.PORT,
	}] as NodeAddress[];

	const getNodesFromBootstrap = async () => {
		const nodesAddresses = await getNodesAddressesFromBootstrap();
		nodesAddresses.forEach(addNodeAddress);
	};

	const addNodeAddress = (nodeAddress: NodeAddress) => {
		if (nodes.every(node => !compareNodeAddresses(node, nodeAddress))) {
			nodes.push(nodeAddress);
		}
	};

	const getContiguousNodesAddresses = () => {
		return nodes.filter(node => { 
			const myNodeAddress = getMyNodeAddresses();
			return !compareNodeAddresses(node, myNodeAddress);
		});
	};

	const getMyNodeAddresses = () => {
		const address = process.env.NODE_ADDRESS;
		const port = process.env.PORT;
    
		if (!(address && port)) {
			throw Error('Missing my node configuration');
		}
		return {
			address,
			port,
		};
	};

	const getAllNodesAddresses = () => [...nodes];

	const clearNodesAddresses = () => {
		nodes = [{
			address: process.env.NODE_ADDRESS,
			port: process.env.PORT,
		}] as NodeAddress[];
	};

	return {
		getNodesFromBootstrap,
		addNodeAddress,
		getContiguousNodesAddresses,
		getMyNodeAddresses,
		getAllNodesAddresses,
		clearNodesAddresses
	};
})();

export type NodeService = typeof nodeService;
