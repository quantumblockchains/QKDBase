import { generateRandomBinaryArray } from '../utils/generateRandomBinaryArray';
import { log } from '../utils/log';
import { sendOneTimePad, checkIfOneTimePadIsEstablished } from './http.service';
import { nodeService } from './node.service';

export interface OneTimePadMapping {
  oneTimePad: number[];
  nodeHash: string;
}

export const oneTimePadService = (() => {
  let oneTimePadMapping = [] as OneTimePadMapping[];

  const { getContiguousNodesHashes, getMyNodeHash } = nodeService;
  const contiguousNodesHashes = getContiguousNodesHashes();
  const myNodeHash = getMyNodeHash();

  const establishOneTimePad = async () => {
    log('Establishing one time pad with peers - transaction');
    for (const nodeHash of contiguousNodesHashes) {
      const { body } = await checkIfOneTimePadIsEstablished(
        nodeHash,
        myNodeHash
      );
      const { oneTimePad } = body;
      const oneTimePadFromMapping = getOneTimePadFromMapping(nodeHash);
      if (!!body && compareOneTimePads(oneTimePadFromMapping, oneTimePad)) {
        throw Error('Non matching one time pad');
      }
      if (!(!!body && compareOneTimePads(oneTimePadFromMapping, oneTimePad))) {
        generateAndSendOneTimePad(nodeHash);
      }
    }
    return oneTimePadMapping;
  };

  const getOneTimePadFromMapping = (nodeHash: string) => {
    const filteredOneTimePadMapping = oneTimePadMapping.filter(
      (oneTimePadMap) => oneTimePadMap.nodeHash === nodeHash
    )[0];
    return filteredOneTimePadMapping?.oneTimePad;
  };

  const generateAndSendOneTimePad = async (nodeHash: string) => {
    const oneTimePad = generateRandomBinaryArray(35);
    oneTimePadMapping.push({
      nodeHash,
      oneTimePad
    });
    await sendOneTimePad(nodeHash, oneTimePad, myNodeHash);
  };

  const checkIfOneTimePadExists = (nodeHash: string) => {
    log('Checking if one time pad exists');
    const toeplitzObjectFound = oneTimePadMapping.filter(
      (oneTimePadMap) => oneTimePadMap.nodeHash === nodeHash
    )[0];
    return toeplitzObjectFound?.oneTimePad;
  };

  const addOneTimePad = (oneTimePad: number[], nodeHash: string) => {
    log('Adding established one time pad');
    if (!oneTimePadMapping.some(oneTimePadMap => oneTimePadMap.nodeHash === nodeHash)) {
      oneTimePadMapping.push({
        nodeHash,
        oneTimePad
      });
    }
  };

  const clearOneTimePads = () => {
    oneTimePadMapping = [];
  };

  const getOneTimePadMapping = () => oneTimePadMapping;

  return {
    establishOneTimePad,
    checkIfOneTimePadExists,
    addOneTimePad,
    clearOneTimePads,
    getOneTimePadMapping,
  };
})();

const compareOneTimePads = (leftOneTimePad: number[], rightOneTimePad: number[]) => {
  if (!leftOneTimePad || !rightOneTimePad) {
    return false;
  }
  return leftOneTimePad.every((value, index) => value === rightOneTimePad[index]);
}