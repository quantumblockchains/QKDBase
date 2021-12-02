import { sendDataProposal } from './http.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';

export const buildDataService = (nodeService: NodeService) => {
  let dataProposal: string | undefined = undefined;

  const { getContiguousNodesAddresses } = nodeService;

  const sendDataProposalToAllPeers = async (toeplitzGroupSignature: string[]) => {
    log('Sending data proposal to peers');
    const contiguousNodesAddresses = getContiguousNodesAddresses();
    for (const nodeAddresses of contiguousNodesAddresses) {
      await sendDataProposal(nodeAddresses, dataProposal, toeplitzGroupSignature);
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
};
