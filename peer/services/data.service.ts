import { sendDataProposal } from './http.service';
import { log } from '../../shared/utils/log';
import { NodeService } from './node.service';

export const buildDataService = (nodeService: NodeService) => {
	let dataProposal: string | undefined = undefined;

	const { getContiguousNodesAddresses } = nodeService;

	const sendDataProposalWithGroupSignatureToAllPeers = async (toeplitzGroupSignature: string[]) => {
		log('Sending data proposal to peers');
		const contiguousNodesAddresses = getContiguousNodesAddresses();
		for (const nodeAddress of contiguousNodesAddresses) {
			if (!dataProposal) {
				throw Error('Empty data proposal');
			} else {
				await sendDataProposal(nodeAddress, dataProposal, toeplitzGroupSignature);
			}
		}
	};

	const setDataProposal = (data: string) => {
		log('Storing data proposal');
		if (dataProposal && dataProposal !== data) {
			throw Error('Invalid data proposal');
		} else if (!dataProposal) {
			dataProposal = data;
		}
	};

	const getDataProposal = () => {
		if (!dataProposal) {
			throw Error('Empty data proposal');
		}
		return dataProposal;
	};

	const clearDataProposal = () => {
		dataProposal = undefined;
	};

	return {
		sendDataProposalWithGroupSignatureToAllPeers,
		setDataProposal,
		getDataProposal,
		clearDataProposal
	};
};
