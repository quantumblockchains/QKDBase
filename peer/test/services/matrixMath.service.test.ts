import { matrixMathService } from '../../services/matrixMath.service';
import { matrix } from 'mathjs';

const {
	isToeplitzMatrix,
	compareToeplitzMatrixes,
	generateToeplitzMatrix,
	convertStringToBinary,
	calculateModuloFromVectorElements,
	toeplitzMatrixToVector
} = matrixMathService();

describe('Checks if object is Toeplitz matrix',() => {
	test('Empty matrix is not a Toeplitz matrix ', () => {
		const testMatrix = [[],[]];
		expect(isToeplitzMatrix(testMatrix)).toBe(false);
	});
	test('Empty vector ', () => {
		const testVector: number[][] = [];
		expect(isToeplitzMatrix(testVector)).toBe(false);
	});
	test('Vector ', () => {
		const testVector = [[1,2,3,4]];
		expect(isToeplitzMatrix(testVector)).toBe(false);
	});
	test('Stack of vectors ', () => {
		const testArray = [[1,1,1],[1,1,1,1],[1,1,1,1,1]];
		expect(isToeplitzMatrix(testArray)).toBe(false);
	});
	test('Quasi toeplitz non- square matrix', () => {
		const testMatrix = [[1,2,3],[4,1,2]];
		expect(isToeplitzMatrix(testMatrix)).toBe(false);
	});
	test('Toeplitz square matrix', () => {
		const testMatrix = [[1,2,3],[4,1,2],[5,4,1]];
		expect(isToeplitzMatrix(testMatrix)).toBe(true);
	});
});

describe('Generate Toeplitz Matrix', () => {
	test('single number generates toeplitz matrix', () => {
		const testToeplitMatrix = generateToeplitzMatrix([3]);
		const expectedMatrix = [[3]];
		expect(testToeplitMatrix).toEqual(expectedMatrix);
	});
	test('Array of even length throws an error', () => {
		const testArray = [1,2]; 
		expect(() => {
			generateToeplitzMatrix(testArray);}).toThrow();
	});
	test('Simple array is transformed into toeplitz matrix', () => {
		const testToeplitzMatrix = generateToeplitzMatrix([1,2,3]); 
		const expectedMatrix = [[1,2],[3,1]];
		expect(testToeplitzMatrix).toEqual(expectedMatrix);
	});
	test('Long array is transformed into toeplix matrix',() => {
		const testToeplitzMatrix = generateToeplitzMatrix([...Array(199).keys()]);
		expect(isToeplitzMatrix(testToeplitzMatrix)).toBe(true);});
});

describe('Compare Toeplitz Matrixes', () => {
	test('Two empty vectors are not Toeplitz Matricies', () => {
		const testVector: number[][] = [];
		expect(compareToeplitzMatrixes(testVector,testVector)).toBe(false);
	});
	test('Empty vectors and empty matrix are not the same', () => {
		const testVector: number[][] = [];
		const textMatrix = [[],[]];
		expect(compareToeplitzMatrixes(testVector,textMatrix)).toBe(false);
	});
	test('Two the same toeplitz matrices', () => {
		const textMatrix = [[1,2],[3,4]];
		expect(compareToeplitzMatrixes(textMatrix,textMatrix)).toBe(true);
	});
	test('Two the same vectors', () => {
		const textMatrix = [[1,2,3,4]];
		expect(compareToeplitzMatrixes(textMatrix,textMatrix)).toBe(false);
	});
	test('Two different toeplitz matricies', () => {
		const testMatrix1 = generateToeplitzMatrix([1,2,3,4,5,6,7]);
		const testMatrix2 = generateToeplitzMatrix([1,2,3,4,5,6,8]);
		expect(compareToeplitzMatrixes(testMatrix1,testMatrix2)).toBe(false);
	});
	test('Jagged arrays even if are the same are not matrices', () => {
		const testArray1 = [[1,2],[3,4,5],[-1,2],[3,4,5,10]];
		const testArray2 = [[1,2],[3,4,5],[-1,2],[3,4,5,10]];
		expect(compareToeplitzMatrixes(testArray1,testArray2)).toBe(false);
	});
});

describe('Converts string to binary', () => {
	test('Empty string should return empty array', () => {
		expect(convertStringToBinary('')).toStrictEqual([]);
	});
	test('Ansi character "a" should be converted to 8 bits',() => {
		const stringAsBinary = convertStringToBinary('a');
		expect(stringAsBinary.length).toBe(8);
	});
}) ; 

describe('Calculate Modulo From Matrix Elements', () => {
	test('Empty string should throw an error ', () => {
		expect(() => {
			calculateModuloFromVectorElements(matrix([]));}).toThrow;
	});
	test('Array filled with number 1 should be unaffected', () => {
		const length = 10;
		const testVector = Array(length).fill(1);
		const modulo = calculateModuloFromVectorElements(matrix(testVector));
		expect(modulo.toArray()).toStrictEqual(testVector);
	});
	test('Array filled with number 2 should be converted to array of zeros', () => {
		const length = 10;
		const testVector = Array(length).fill(2);
		const zerosVector = Array(length).fill(0);
		const modulo = calculateModuloFromVectorElements(matrix(testVector));
		expect(modulo.toArray()).toStrictEqual(zerosVector);
	});
});

describe('Converts Toeplitz matrix to vector', () => {
	test('Toeplitz Matrix should be converted to vector which was used to generate that matrix', () => {
		const testVector = [1,2,3,4,5,6,7];
		const toeplitxMatrix = generateToeplitzMatrix(testVector);	
		const outVector = toeplitzMatrixToVector(toeplitxMatrix);
		expect(outVector).toStrictEqual(testVector);
	});
});



