import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { NodeAddresses } from '../../../shared/types';

const handlers = [
  rest.post('http://test-address:1/receive-data-proposal', (_request, response) => {
    return response();
  }),
  rest.post('http://test-address:1/verify-and-vote', (_request, response) => {
    return response();
  }),
  rest.post('http://test-address:1/add-vote', (_request, response) => {
    return response();
  }),
  rest.post('http://test-address:1/voting-finished', (_request, response) => {
    return response();
  }),
  rest.post<NodeAddresses, never, NodeAddresses[]>('http://bootstrap_node/connected-nodes',
    (_request, response, context) => response(
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
    )
  ),
  rest.post('http://test-address:2/receive-one-time-pad', (_request, response) => {
    return response();
  }),
  rest.post<{ address: string }, never,{ oneTimePad: number[] }>('http://test-address:2/check-one-time-pad',
    (_request, response, context) => response(
    context.json({ oneTimePad: [1,1,0,1,0] })
  )),
  rest.post<{ address: string }, never,{ oneTimePad: null }>('http://wrong-address:2/check-one-time-pad',
    (_request, response, context) => response(
    context.json({ oneTimePad: null })
  )),
  rest.post('http://wrong-address:2/receive-one-time-pad', (_request, response) => {
    return response();
  }),
  rest.post('http://testaddressFirst:2/check-toeplitz', (_request, response, ctx) => {
    return response(
      ctx.status(200),
      ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
    );
  }),
  rest.post('http://testaddressFirst:2/receive-toeplitz', (_request, response, ctx) => {
    return response(
      ctx.status(200),
      ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
    );
  }),
  rest.post('http://testaddressSecond:2/check-toeplitz', (_request, response, ctx) => {
    return response(
      ctx.status(200),
      ctx.json({ toeplitzMatrix: null })
    );
  }),
  rest.post('http://testaddressSecond:2/receive-toeplitz', (_request, response, ctx) => {
    return response(
      ctx.status(200),
      ctx.json({ toeplitzMatrix: null})
    );
  })
];

export const server = setupServer(...handlers);
