import { blockService } from './block.service';
import { blockchainService } from './blockchain.service';
import { nodeService } from './node.service';
import { oneTimePadService } from './oneTimePad.service';
import { toeplitzService } from './toeplitz.service';
import { transactionService } from './transaction.service';
import { votingService } from './voting.service';

export const services = {
  blockService,
  blockchainService,
  nodeService,
  oneTimePadService,
  toeplitzService,
  transactionService,
  votingService
}

export type Services = typeof services
