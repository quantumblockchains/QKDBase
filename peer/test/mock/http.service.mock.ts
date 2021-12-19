import { rest } from 'msw';
import { setupServer } from 'msw/node';

interface ReceiveDataProposalBody {
  dataProposal: string;
  toeplitzGroupSignature: string[];
}

const handlers = [
  rest.post<ReceiveDataProposalBody>('http://testaddress:1/receive-data-proposal', (_request, response, ctx) => {
    return response(
      ctx.status(200)
    );
  })
];

export const server = setupServer(...handlers);
