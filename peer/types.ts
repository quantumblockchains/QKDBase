export interface Block {
  index: number;
  previousBlockHash: string;
  data: string;
  timestamp: number;
  hash: string
}

export interface DataProposalRequest {
  dataProposal: string;
  toeplitzGroupSignature: string[];
}
