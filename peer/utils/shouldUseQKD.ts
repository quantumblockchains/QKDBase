import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

export const shouldUseQKD = process.env.QKD_GET_KEY_URL;
