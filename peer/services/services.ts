import { nodeService } from './node.service';
import { buildDataService } from './data.service';
import { buildOneTimePadService } from './oneTimePad.service';
import { buildToeplitzService } from './toeplitz.service';
import { buildTransactionService } from './transaction.service';
import { buildVotingService } from './voting.service';
import { buildQKDService } from './qkd.service';
import { buildQRNGService } from './qrng.service';
import { buildBlockService } from './block.service';
import { buildBlockchainService } from './blockchain.service';

export const buildServices = (): Services => {
	const blockService = buildBlockService(nodeService);
	const blockchainService = buildBlockchainService();
	const oneTimePadService = buildOneTimePadService(nodeService);
	const toeplitzService = buildToeplitzService(nodeService);
	const transactionService = buildTransactionService(nodeService);
	const votingService = buildVotingService(nodeService);
	const qkdService = buildQKDService(nodeService, oneTimePadService);
	const qrngService = buildQRNGService(nodeService);
  
	return {
		nodeService,
		blockService,
		blockchainService,
		oneTimePadService,
		toeplitzService,
		transactionService,
		votingService,
		qkdService,
		qrngService
	};
};

export interface Services {
  nodeService: typeof nodeService,
  blockService: ReturnType<typeof buildBlockService>,
  blockchainService: ReturnType<typeof buildBlockchainService>,
  oneTimePadService: ReturnType<typeof buildOneTimePadService>,
  toeplitzService: ReturnType<typeof buildToeplitzService>,
  transactionService: ReturnType<typeof buildTransactionService>,
  votingService: ReturnType<typeof buildVotingService>
  qkdService: ReturnType<typeof buildQKDService>
  qrngService: ReturnType<typeof buildQRNGService>
}
