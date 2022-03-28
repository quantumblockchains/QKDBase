import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });

const convertNumberToTime = (num: number) => {
	let numString = String(num);
	if (num / 10 < 1) {
		numString = '0' + numString;
	}
	return numString;
};

export const log = (message: string) => {
	if (process.env.NODE_ENV !== 'test') {
		const hours = (new Date()).getHours();
		const minutes = (new Date()).getMinutes();
		const seconds = (new Date()).getSeconds();
		const miliseconds = (new Date()).getMilliseconds();
		const date = convertNumberToTime(hours) + 
      ':' + 
      convertNumberToTime(minutes) + 
      ':' + 
      convertNumberToTime(seconds) + 
      ':' + 
      String(miliseconds);
		console.log(`${date} - ${message}`);
	}
};
