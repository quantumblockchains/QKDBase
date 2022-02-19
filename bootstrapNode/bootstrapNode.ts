import express from 'express';
import { connectedNodesService } from './connectedNodes.service';
import { NodeAddress } from '../shared/types';
import { log } from '../shared/utils/log';

const jsonParser = express.json();

const app = express();
const port = 3010;

const { addNode, getConnectedNodes, sendAddNodeAddressToAll } = connectedNodesService();

app.post('/connected-nodes', jsonParser, async (req, res) => {
	const nodeAddress = req.body as NodeAddress;
	const { address, port } = nodeAddress;
  
	log(`Received request to fetch connected nodes from: ${address}`);

	if (!(address && port)) {
		res.status(400).send('Missing node addresses');
		return;
	}
	try {
		const connectedNodes = getConnectedNodes();
		await sendAddNodeAddressToAll(nodeAddress);
		addNode(nodeAddress);
		res.send(connectedNodes);
	} catch (error) {
		res.status(400).send({
			error,
		});
	}
});

app.listen(port, () => {
	console.log(`Bootstrap node listening at ${port}`);
});
