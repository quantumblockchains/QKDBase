import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

export const log = (message: string) => {
	if (process.env.NODE_ENV !== 'test') {
		console.log(message);
	}
};
