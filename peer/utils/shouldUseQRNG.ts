import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

export const shouldUseQRNG = process.env.QRNG_GET_RANDOM_ARRAY_URL && process.env.QRNG_GET_RANDOM_ARRAY_API_KEY;
