import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { NodeAddresses } from '../../../shared/types';

const handlers = [
  rest.post('http://testaddress:1/receive-data-proposal', (_request, response) => {
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
  rest.post<NodeAddresses, never, NodeAddresses[]>('http://bootstrap_node/connected-nodes',
    (_request, response, context) => {
      return response(
        context.json([
          {
            address: 'testFirstAddress',
            normalConnectionPort: '1',
            quantumConnectionPort: '2'
          },
          {
            address: 'testSecondAddress',
            normalConnectionPort: '1',
            quantumConnectionPort: '2'
          }
        ])
      );
  })
];

export const server = setupServer(...handlers);
