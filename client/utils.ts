import dotenv from 'dotenv';
dotenv.config();

export const getFirstPeersAddresses = () => process.env.FIRST_PEER_HASH;
