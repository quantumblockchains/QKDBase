import { rest } from 'msw';
import { setupServer } from 'msw/node';

interface ReceiveDataProposalBody {
  dataProposal: string;
  toeplitzGroupSignature: string[];
}

const handlers = [
  rest.post<ReceiveDataProposalBody>('http://testaddress:1/receive-data-proposal', (_request, response) => {
    return response();
  }),
  rest.post('http://testaddress:1/verify-and-vote', (_request, response) => {
    return response();
  }),
  rest.post('http://testaddress:1/add-vote', (_request, response) => {
    return response();
  }),
  rest.post('http://testaddress:1/voting-finished', (_request, response) => {
    return response();
  }),
];

export const server = setupServer(...handlers);
