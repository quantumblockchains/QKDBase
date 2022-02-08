export const matrixMathService = () => {
  const isToeplitzMatrix = (matrix: number[][]) => {
    if (!matrix) {
      return false;
    }
    const rowNumber = matrix.length;
    if (rowNumber === 0){
      return false;
    } else if (rowNumber === 1) {
        return matrix[0].length === 1; 
      }
    for (let row = 1; row < rowNumber; row ++) {
      const colNumber = matrix[row].length;
      if (rowNumber !== colNumber){
        return false;
      }
      for (let column = 1; column < colNumber - 1; column ++) {
        if (matrix[row][column] !== matrix[row - 1][column - 1]) {
          return false;
        }
      }
    }
    return true;
  };

  const compareToeplitzMatrixes = (leftMatrix: number[][], rightMatrix: number[][]) => {
    if (!(isToeplitzMatrix(leftMatrix) && isToeplitzMatrix(rightMatrix))) {
      return false;
    }
    if (leftMatrix.length !== rightMatrix.length) {
      return false;
    }
    for (let row = 0; row < leftMatrix.length; row++) {
      if (leftMatrix[row][0] !== rightMatrix[row][0]){
        return false;
      }
    }
    for (let column = 1; column < leftMatrix.length; column++) {
      if (leftMatrix[0][column] !== rightMatrix[0][column]){
        return false;
      }
    }
    return true;
  };

  const generateToeplitzMatrix = (binaryArray: number[]) => {
    if (binaryArray.length % 2 === 0) {
      throw Error('generateToeplitzMatrix: length of binaryArray is an even number!');
    }
    const firstRow = binaryArray.slice(0, binaryArray.length / 2 + 1);
    const restRows = binaryArray.slice(binaryArray.length / 2 + 1);
    const matrix = [firstRow];
    for (let row = 0; row < restRows.length; row++) {
      const emptyRow = new Array(restRows.length).fill(0);
      matrix.push([restRows[row], ...emptyRow]);
    }
    for (let row = 0; row < matrix.length - 1; row ++) {
      for (let column = 0; column < matrix[0].length - 1; column ++) {
        matrix[row+1][column+1] = matrix[row][column];
      }
    }
    return matrix;
  };

  const convertStringToBinary = (text: string) => {
    let binaryRepresentation = '';
    for (let index = 0; index < text.length; index++) {
      binaryRepresentation += text[index].charCodeAt(0).toString(2);
    }
    return binaryRepresentation;
  };

  const createVectorFromStringAsBinary = (stringAsBinary: string) => {
    if (stringAsBinary.length === 0){
      throw Error('createVectorFromStringAsBinary: empty string!');
    }
    const matrix = [];
    for (let i=0; i < stringAsBinary.length; i++) {
      matrix[i] = [Number(stringAsBinary[i])];
    }
    return matrix;
  };

  const calculateModuloFromVectorElements = (array: number[]) => {
    if (array.length === 0){
      throw Error('calculateModuloFromVectorElements: empty array!');
    }
    return array
      .map(element => {
        return element % 2;
      })
      .join('');
  };

  const calculateXor = (leftBinary: string, rightBinary: string) => {
    let XorResult = '';
    if (leftBinary.length !== rightBinary.length) {
      throw Error('calculateXor: unequal strings!');
    }
    for (let index = 0; index < leftBinary.length; index++) {
      XorResult += leftBinary[index].charCodeAt(0) ^ rightBinary[index].charCodeAt(0);
    }
    return XorResult;
  };

  return {
    isToeplitzMatrix,
    compareToeplitzMatrixes,
    generateToeplitzMatrix,
    convertStringToBinary,
    createVectorFromStringAsBinary,
    calculateModuloFromVectorElements,
    calculateXor
  };
};
