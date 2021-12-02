import { matrix, multiply } from 'mathjs';
import { generateRandomBinaryArray } from '../utils/generateRandomBinaryArray';
import { checkIfToeplitzMatrixIsEstablished, sendTopelitzMatrix } from './http.service';
import { nodeService } from './node.service';
import { OneTimePadMapping } from './oneTimePad.service';
import { matrixMathService } from './matrixMath.service';
import { log } from '../utils/log';

export interface ToeplitzMatrixMapping {
  toeplitzMatrix: number[][];
  nodeHash: string;
}

export const toeplitzService = (() => {
  let teoplitzMatrixesMapping = [] as ToeplitzMatrixMapping[];
  let toeplitzGroupSignature = [] as string[];

  const { getContiguousNodesHashes, getMyNodeHash } = nodeService;
  const contiguousNodesHashes = getContiguousNodesHashes();
  const myNodeHash = getMyNodeHash();

  const {
    isToeplitzMatrix,
    compareToeplitzMatrixes,
    generateToeplitzMatrix,
    convertStringToBinary,
    createMatrixFromStringAsBinary,
    calculateModuloFromMatrixElements,
    calculateXor
  } = matrixMathService();

  const establishToeplitzMatrix = async (transactionLength: number) => {
    log('Establishing Toeplitz matrix with peers - transaction');
    for (const nodeHash of contiguousNodesHashes) {
      const { body } = await checkIfToeplitzMatrixIsEstablished(
        nodeHash,
        myNodeHash
      );
      const { toeplitzMatrix } = body;
      const toeplitzMatrixFromMapping = getToeplitzMatrixFromMapping(nodeHash);
      if (!!toeplitzMatrix && !compareToeplitzMatrixes(toeplitzMatrixFromMapping, toeplitzMatrix)) {
        throw Error('Non matching Toeplitz matrix');
      } else if (!toeplitzMatrix) {
        generateAndSendToeplitzMatrix(transactionLength, nodeHash);
      } 
    }
    return teoplitzMatrixesMapping;
  };

  const getToeplitzMatrixFromMapping = (nodeHash: string) => {
    const filteredToeplitzMapping = teoplitzMatrixesMapping.filter(
      (toeplitzMap) => toeplitzMap.nodeHash === nodeHash
    )[0];
    return filteredToeplitzMapping?.toeplitzMatrix;
  };

  const generateAndSendToeplitzMatrix = async (transactionLength: number, nodeHash: string) => {
    const seedSize = 2 * transactionLength - 1;
    const binaryArray = generateRandomBinaryArray(seedSize);
    const toeplitzMatrix = generateToeplitzMatrix(binaryArray);
    if (isToeplitzMatrix(toeplitzMatrix)) {
      teoplitzMatrixesMapping.push({
        nodeHash,
        toeplitzMatrix,
      });
      await sendTopelitzMatrix(nodeHash, toeplitzMatrix, myNodeHash);
    } else {
      throw Error('Invalid Toeplitz matrix');
    }
  };

  const checkIfToeplitzAsStringExists = (nodeHash: string) => {
    log('Checking if Toeplitz matrix exists');
    const toeplitzObjectFound = teoplitzMatrixesMapping.filter(
      (toeplitzMap) => toeplitzMap.nodeHash === nodeHash
    )[0];
    return toeplitzObjectFound?.toeplitzMatrix;
  };

  const computeToeplitzHash = (
    data: string,
    toeplitzMatrix: number[][],
    oneTimePad: number[]
  ) => {
    const transactionDataAsBinary = convertStringToBinary(data);
    const transactionMatrix = matrix(createMatrixFromStringAsBinary(transactionDataAsBinary));
    const toeplitzParsedMatrix = matrix(toeplitzMatrix);
    const multipliedMatrixes = multiply(toeplitzParsedMatrix, transactionMatrix);
    const multipliedMatrixesModulo = calculateModuloFromMatrixElements(multipliedMatrixes.toArray() as number[][]);
    const parsedOneTimePad = oneTimePad.join('');
    return calculateXor(multipliedMatrixesModulo, parsedOneTimePad);
  }

  const calculateToeplitzHash = (
    oneTimePadMapping: OneTimePadMapping[],
    dataProposal: string,
    ) => {
    log('Calculating Toeplitz Hash');
    const teoplitzMatrixesMapping = getToeplitzMapping();
    const { toeplitzMatrix } = teoplitzMatrixesMapping[0];
    const { oneTimePad } = oneTimePadMapping[0];
    return computeToeplitzHash(dataProposal, toeplitzMatrix, oneTimePad)
  };

  const generateToeplitzHash = (dataProposal: string) => {
    const dataAsBinary = convertStringToBinary(dataProposal);
    const seedSize = 2 * dataAsBinary.length - 1;
    const binaryArray = generateRandomBinaryArray(seedSize);
    const toeplitzMatrix = generateToeplitzMatrix(binaryArray);
    const oneTimePad = generateRandomBinaryArray(dataAsBinary.length);
    return computeToeplitzHash(dataProposal, toeplitzMatrix, oneTimePad);
  }

  const verifyToeplitzGroupSignature = (
    toeplitzGroupSignature: string[],
    toeplitzHash: string
  ) => {
    log('Verifying data proposal signature');
    return toeplitzGroupSignature.some(hash => hash === toeplitzHash);
  };

  const addToeplitzMatrix = (toeplitzMatrix: number[][], nodeHash: string) => {
    log('Adding established Toeplitz matrix');
    teoplitzMatrixesMapping.push({
      nodeHash,
      toeplitzMatrix
    });
  };

  const getToeplitzMapping = () => teoplitzMatrixesMapping;

  const generateToeplitzGroupSignature = (
    oneTimePadMapping: OneTimePadMapping[],
    transaction: string
    ) => {
    log('Generating Toeplitz Group Signature');
    const teoplitzMatrixesMapping = getToeplitzMapping();
    teoplitzMatrixesMapping.forEach((toeplitzMap) => {
      const oneTimeMap = oneTimePadMapping.filter(
        (map) => map.nodeHash === toeplitzMap.nodeHash
      )[0];
      const toeplitzHash = computeToeplitzHash(
        transaction,
        toeplitzMap.toeplitzMatrix,
        oneTimeMap.oneTimePad
      );
      addToeplitzHashToGroupSignature(toeplitzHash);
    });
    return toeplitzGroupSignature;
  };

  const addToeplitzHashToGroupSignature = (toeplitzHash: string) => {
    log('Adding Toeplitz Hash to Toeplitz Group Signature');
    toeplitzGroupSignature.push(toeplitzHash);
  };

  const storeToeplitzGroupSignature = (toeplitzHashesReceived: string[]) => {
    log('Storing Toeplitz Group Signature');
    toeplitzHashesReceived.forEach(toeplitzHash => toeplitzGroupSignature.push(toeplitzHash));
  };

  const getToeplitzGroupSignature = () => [...toeplitzGroupSignature];

  const clearToeplitzGroupSignature = () => {
    toeplitzGroupSignature = [];
  };

  const clearToeplitzMatrixesMapping = () => {
    teoplitzMatrixesMapping = [];
  };

  return {
    establishToeplitzMatrix,
    checkIfToeplitzAsStringExists,
    addToeplitzMatrix,
    getToeplitzMapping,
    calculateToeplitzHash,
    generateToeplitzHash,
    verifyToeplitzGroupSignature,
    generateToeplitzGroupSignature,
    addToeplitzHashToGroupSignature,
    storeToeplitzGroupSignature,
    getToeplitzGroupSignature,
    clearToeplitzGroupSignature,
    clearToeplitzMatrixesMapping,
  };
})();
