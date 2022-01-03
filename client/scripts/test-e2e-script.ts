import { sendTransaction } from "../api";
import { getFirstPeersAddresses } from "../utils";

(() => {
  try {
    const peerAddress = getFirstPeersAddresses();
    if (peerAddress) {
      sendTransaction(peerAddress, { transaction: '123+rebel_ i*on#yjhk' });
    }
  } catch (error) {
    console.error(error);
  }
})();
