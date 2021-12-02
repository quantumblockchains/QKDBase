import got from 'got';
import { NodeAddresses } from '../shared/types';

export const connectedNodesService = () => {
  const connectedNodes: NodeAddresses[] = [];

  const addNode = (nodeAddresses: NodeAddresses) => connectedNodes.push(nodeAddresses);

  const getConnectedNodes = () => [...connectedNodes];

  const sendAddNodeAddressToAll = async (nodeAddresses: NodeAddresses) => {
    for (const node of connectedNodes) {
      const url = `${node.address}:${node.normalConnectionPort}/add-node`;
      await got.post(url, {
        json: {
          nodeAddresses
        },
      });
    }
  }

  return {
    addNode,
    getConnectedNodes,
    sendAddNodeAddressToAll
  };
};
