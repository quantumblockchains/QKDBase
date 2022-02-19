import dotenv from 'dotenv';
dotenv.config();

export const log = (message: string) => {
	if (process.env.NODE_ENV !== 'test') {
		console.log(message);
	}
};
