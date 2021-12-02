import got from 'got';

export const sendTransaction = async (peerAddress: string, body: any) => {
  try {
    const url = `${peerAddress}:3016/receive-transaction`;
    const response = await got.post(url, {
      json: body,
    });
    return response;
  } catch (error) {
    throw error;
  }
};
