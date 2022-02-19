import express from 'express';
import dotenv from 'dotenv';
import { buildApiRouter } from './routes/api';
import { buildServices } from './services/services';
import { log } from '../shared/utils/log';
dotenv.config();

export const buildPeer = async (onSuccess: () => void, onError: () => void) => {
	try {
		validateEnvVariables();

		const services = buildServices();
		await services.nodeService.getNodesFromBootstrap();

		const connection = express();
		const port = process.env.PORT;

		connection.use(buildApiRouter(services, onSuccess, onError));
    
		connection.listen(port, () => {
			log('Peer listening');
		});

	} catch (error) {
		console.error(error);
	}
};

const validateEnvVariables = () => {
	const nodeAddress = process.env.NODE_ADDRESS;
	const port = process.env.PORT;
	const bootstrapNodeAddress = process.env.BOOTSTRAP_NODE_ADDRESS;

	if (!(nodeAddress && port && bootstrapNodeAddress)) {
		throw Error('Invalid environment variables');
	}
};
