

export const connectedNodesService = () => {
  const connectedNodes: string[] = [];

  const addNode = (nodeAddress: string) => connectedNodes.push(nodeAddress);

  const getConnectedNodes = () => [...connectedNodes];

  return {
    addNode,
    getConnectedNodes,
  };
};
