import { generateRandomBinaryArray } from '../utils/generateRandomBinaryArray';
import { log } from '../../shared/utils/log';
import { sendOneTimePad, checkIfOneTimePadIsEstablished } from './http.service';
import { NodeService } from './node.service';
import { NodeAddresses } from '../../shared/types';

export interface OneTimePadMapping {
  oneTimePad: number[];
  nodeAddress: string;
}

export const buildOneTimePadService = (nodeService: NodeService) => {
  let oneTimePadMapping = [] as OneTimePadMapping[];

  const { getContiguousNodesAddresses, getMyNodeAddresses } = nodeService;

  const establishOneTimePad = async (transactionLength: number) => {
    log('Establishing one time pad with peers - transaction');
    const contiguousNodesAddresses = getContiguousNodesAddresses();
    const myNodeAddress = getMyNodeAddresses();
    for (const nodeAddresses of contiguousNodesAddresses) {
      const { oneTimePad } = await checkIfOneTimePadIsEstablished(
        nodeAddresses,
        myNodeAddress.address
      );
      const oneTimePadFromMapping = getOneTimePadFromMapping(nodeAddresses.address);
      if (!!oneTimePad && compareOneTimePads(oneTimePadFromMapping, oneTimePad)) {
        throw Error('Non matching one time pad');
      }
      if (!(!!oneTimePad && compareOneTimePads(oneTimePadFromMapping, oneTimePad))) {
        generateAndSendOneTimePad(transactionLength, nodeAddresses);
      }
    }
    return oneTimePadMapping;
  };

  const getOneTimePadFromMapping = (nodeAddress: string) => {
    const filteredOneTimePadMapping = oneTimePadMapping.filter(
      (oneTimePadMap) => oneTimePadMap.nodeAddress === nodeAddress
    )[0];
    return filteredOneTimePadMapping?.oneTimePad;
  };

  const generateAndSendOneTimePad = async (transactionLength: number, nodeAddresses: NodeAddresses) => {
    const oneTimePad = generateRandomBinaryArray(transactionLength); 
    oneTimePadMapping.push({
      nodeAddress: nodeAddresses.address,
      oneTimePad
    });
    const myNodeAddress = getMyNodeAddresses();
    await sendOneTimePad(nodeAddresses, oneTimePad, myNodeAddress.address);
  };

  const checkIfOneTimePadExists = (nodeAddress: string) => {
    log('Checking if one time pad exists');
    const toeplitzObjectFound = oneTimePadMapping.filter(
      (oneTimePadMap) => oneTimePadMap.nodeAddress === nodeAddress
    )[0];
    return toeplitzObjectFound?.oneTimePad;
  };

  const addOneTimePad = (oneTimePad: number[], nodeAddress: string) => {
    log('Adding established one time pad');
    if (!oneTimePadMapping.some(oneTimePadMap => oneTimePadMap.nodeAddress === nodeAddress)) {
      oneTimePadMapping.push({
        nodeAddress,
        oneTimePad
      });
    }
  };

  const clearOneTimePads = () => {
    oneTimePadMapping = [];
  };

  const getOneTimePadMapping = () => [...oneTimePadMapping];

  return {
    establishOneTimePad,
    checkIfOneTimePadExists,
    addOneTimePad,
    clearOneTimePads,
    getOneTimePadMapping,
  };
};

const compareOneTimePads = (leftOneTimePad: number[], rightOneTimePad: number[]) => {
  if (!leftOneTimePad || !rightOneTimePad) {
    return false;
  }
  return leftOneTimePad.every((value, index) => value === rightOneTimePad[index]);
};
