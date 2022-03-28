import { nodeService } from './node.service';
import { buildOneTimePadService } from './oneTimePad.service';
import { buildToeplitzService } from './toeplitz.service';
import { buildTransactionService } from './transaction.service';
import { buildVotingService } from './voting.service';
import { buildoneTimePadByQKD } from './oneTimePadQKD.service';
import {buildoneToeplitzByQKD} from './toeplitzQKD.service';
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
	const oneTimePadByQKD = buildoneTimePadByQKD(nodeService, oneTimePadService);
	const toeplitzByQKD = buildoneToeplitzByQKD(nodeService, toeplitzService);
	const qrngService = buildQRNGService(nodeService);
  
	return {
		nodeService,
		blockService,
		blockchainService,
		oneTimePadService,
		toeplitzService,
		transactionService,
		votingService,
		oneTimePadByQKD,
		toeplitzByQKD,
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
  votingService: ReturnType<typeof buildVotingService>,
  oneTimePadByQKD: ReturnType<typeof buildoneTimePadByQKD>,
  toeplitzByQKD: ReturnType<typeof buildoneToeplitzByQKD>,
  qrngService: ReturnType<typeof buildQRNGService>
}
