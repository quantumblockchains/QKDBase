import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { NodeAddress } from '../../../shared/types';

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
	rest.post<NodeAddress, never, NodeAddress[]>('http://bootstrap_node/connected-nodes',
		(_request, response, context) => response(
			context.json([
				{
					address: 'testFirstAddress',
					port: '1',
				},
				{
					address: 'testSecondAddress',
					port: '1',
				}
			])
		)
	),
	rest.post('http://test-address:1/receive-one-time-pad', (_request, response) => {
		return response();
	}),
	rest.post<{ address: string }, never,{ oneTimePad: number[] }>('http://test-address:1/check-one-time-pad',
		(_request, response, context) => response(
			context.json({ oneTimePad: [1,1,0,1,0] })
		)),
	rest.post<{ address: string }, never,{ oneTimePad: null }>('http://wrong-address:1/check-one-time-pad',
		(_request, response, context) => response(
			context.json({ oneTimePad: null })
		)),
	rest.post('http://wrong-address:1/receive-one-time-pad', (_request, response) => {
		return response();
	}),
	rest.post('http://testaddressFirst:1/check-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
		);
	}),
	rest.post('http://testaddressFirst:1/receive-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
		);
	}),
	rest.post('http://testaddressSecond:1/check-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: null })
		);
	}),
	rest.post('http://testaddressSecond:1/receive-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: null})
		);
	})
];

export const server = setupServer(...handlers);
