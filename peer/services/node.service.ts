import dotenv from 'dotenv';
import { getNodesAddressesFromBootstrap } from './http.service';
import { compareNodeAddresses } from '../utils/compareNodeAddresses';
import { NodeAddresses } from '../../shared/types';
dotenv.config();

export const nodeService = (() => {
  const nodes = [{
    address: process.env.NODE_ADDRESS,
    normalConnectionPort: process.env.NORMAL_CONNECTION_PORT,
    quantumConnectionPort: process.env.QUANTUM_CONNECTION_PORT
  }] as NodeAddresses[];

  const getNodesFromBootstrap = async () => {
    const nodesAddresses = await getNodesAddressesFromBootstrap();
    nodesAddresses.forEach(addNodeAddress);
  };

  const addNodeAddress = (nodeAddresses: NodeAddresses) => {
    if (nodes.every(node => !compareNodeAddresses(node, nodeAddresses))) {
      nodes.push(nodeAddresses);
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
    const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
    const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;
    
    if (!(address && normalConnectionPort && quantumConnectionPort)) {
      throw Error('Missing my node configuration');
    }
    return {
      address,
      normalConnectionPort,
      quantumConnectionPort
    };
  };

  const getAllNodesAddresses = () => [...nodes];

  return {
    getNodesFromBootstrap,
    addNodeAddress,
    getContiguousNodesAddresses,
    getMyNodeAddresses,
    getAllNodesAddresses
  };
})();

export type NodeService = typeof nodeService;
