import crypto from 'crypto';

export const computeHashedSignature = (toeplitzSignature: string,	address: string) => {
	const blockString = `${toeplitzSignature}-${address}`;
	const hashFunction = crypto.createHash('sha256');
	hashFunction.update(blockString);
	return hashFunction.digest('hex');
};
