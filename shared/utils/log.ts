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
		let date = convertNumberToTime(hours) + ':' + convertNumberToTime(minutes) + ':'
			+ convertNumberToTime(seconds) + ':';  
		if (miliseconds < 100){
			if (miliseconds < 10) {
				date = 	date + '00'+ String(miliseconds);
			} else {
				date = 	date + '0'+ String(miliseconds);
			}
		} else {
			date = 	date + String(miliseconds);
		}
		console.log(`${date} - ${message}`);
	}
};
