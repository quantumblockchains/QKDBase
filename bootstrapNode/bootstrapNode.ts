import express from 'express';
import { connectedNodesService } from './connectedNodes.service';

const jsonParser = express.json();

const app = express();
const port = 3010;

const { addNode, getConnectedNodes } = connectedNodesService();

app.get('/connected-nodes', jsonParser, async (req, res) => {
  if (!req.query.address) {
    res.status(400).send('Missing node address');
    return;
  }
  try {
    const connectedNodes = getConnectedNodes();
    addNode(req.query.address as string);
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
