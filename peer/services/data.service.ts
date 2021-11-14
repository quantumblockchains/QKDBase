import { sendDataProposal } from './http.service';
import { nodeService } from './node.service';
import { log } from '../utils/log';

export const dataService = (() => {
  let dataProposal: string | undefined = undefined;

  const { getContiguousNodesHashes } = nodeService;
  const contiguousNodesHashes = getContiguousNodesHashes();

  const sendDataProposalToAllPeers = async (toeplitzGroupSignature: string[]) => {
    log('Sending data proposal to peers');
    for (const nodeHash of contiguousNodesHashes) {
      await sendDataProposal(nodeHash, dataProposal, toeplitzGroupSignature);
    }
  };

  const setDataProposal = (data: string) => {
    log('Storing data proposal');
    if (!dataProposal) {
      dataProposal = data;
    } else if (dataProposal && dataProposal !== data) {
      throw Error('Invalid data proposal');
    }
  };

  const getDataProposal = () => dataProposal;

  const clearDataProposal = () => {
    dataProposal = undefined;
  };

  return {
    sendDataProposalToAllPeers,
    setDataProposal,
    getDataProposal,
    clearDataProposal
  };
})();
