import got from 'got';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendTransaction = async (peerAddress: string, body: Record<string, any>) => {
	try {
		const url = `${peerAddress}:3016/receive-transaction`;
		const response = await got.post(url, {
			json: body,
		});
		return response;
	} catch (error) {
		console.error(error);
	}
};
