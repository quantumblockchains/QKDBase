import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { NodeAddress } from '../../../shared/types';

const handlers = [
	rest.post('http://test-address/receive-data-proposal', (_request, response) => {
		return response();
	}),
	rest.post('http://test-address/verify-and-vote', (_request, response) => {
		return response();
	}),
	rest.post('http://test-address/add-vote', (_request, response) => {
		return response();
	}),
	rest.post('http://test-address/voting-finished', (_request, response) => {
		return response();
	}),
	rest.post<NodeAddress, never, NodeAddress[]>('http://bootstrap_node/connected-nodes',
		(_request, response, context) => response(
			context.json([
				{
					address: 'testFirstAddress',
				},
				{
					address: 'testSecondAddress',
				}
			])
		)
	),
	rest.post('http://test-address/receive-one-time-pad', (_request, response) => {
		return response();
	}),
	rest.post<{ address: string }, never,{ oneTimePad: number[] }>('http://test-address/check-one-time-pad',
		(_request, response, context) => response(
			context.json({ oneTimePad: [1,1,0,1,0] })
		)),
	rest.post<{ address: string }, never,{ oneTimePad: null }>('http://wrong-address/check-one-time-pad',
		(_request, response, context) => response(
			context.json({ oneTimePad: null })
		)),
	rest.post('http://wrong-address/receive-one-time-pad', (_request, response) => {
		return response();
	}),
	rest.post('http://testaddressFirst/check-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
		);
	}),
	rest.post('http://testaddressFirst/receive-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: [[1,0,1],[1,1,0],[0,1,1]] })
		);
	}),
	rest.post('http://testaddressSecond/check-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: null })
		);
	}),
	rest.post('http://testaddressSecond/receive-toeplitz', (_request, response, ctx) => {
		return response(
			ctx.status(200),
			ctx.json({ toeplitzMatrix: null})
		);
	})
];

export const server = setupServer(...handlers);
