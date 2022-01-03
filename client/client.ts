import express from 'express';
import { sendTransaction } from './api';
import { getFirstPeersAddresses } from './utils';

const jsonParser = express.json();

const app = express();
const port = 3015;

app.post('/send-transaction', jsonParser, async (req, res) => {
  try {
    const body = req.body;
    const peerAddress = getFirstPeersAddresses();
    if (peerAddress) {
      await sendTransaction(peerAddress, body);
      res.send({
        message: 'Transactions sent',
      });
    } else {
      res.status(400).send({ message: 'Missing peer address '});
    }
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
});

app.listen(port, () => {
  console.log(`Client listening at http://localhost:${port}`);
});
