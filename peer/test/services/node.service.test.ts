import { nodeService } from '../../services/node.service';
import { server } from '../mock/http.service.mock';

describe('Node service', () => {
  beforeEach(() => nodeService.clearNodesAddresses());

  describe('getMyNodeAddresses', () => {
    test('Return my node address', () => {
      const address = process.env.NODE_ADDRESS;
      const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
      const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;
      const myNodeAddress = {
        address,
        normalConnectionPort,
        quantumConnectionPort
      };
      const myNodeAddressFromService = nodeService.getMyNodeAddresses();
      expect(myNodeAddressFromService).toEqual(myNodeAddress);
    });
  });
  
  describe('getContiguousNodesAddresses', () => {
    test('Return my contiguous addresses', () => {
      const nodeAddress = {
        address: 'testAddress',
        normalConnectionPort: '1',
        quantumConnectionPort: '2'
      };
      nodeService.addNodeAddress(nodeAddress);
      const contiguousNodesAddresses = nodeService.getContiguousNodesAddresses();
      expect(contiguousNodesAddresses).toEqual([nodeAddress]);
    });
  });

  describe('getAllNodesAddresses', () => {
    test('Return all nodes addresses', () => {
      const address = process.env.NODE_ADDRESS;
      const normalConnectionPort = process.env.NORMAL_CONNECTION_PORT;
      const quantumConnectionPort = process.env.QUANTUM_CONNECTION_PORT;
      const myNodeAddress = {
        address,
        normalConnectionPort,
        quantumConnectionPort
      };
      const nodeAddress = {
        address: 'testAddress',
        normalConnectionPort: '1',
        quantumConnectionPort: '2'
      };
      nodeService.addNodeAddress(nodeAddress);
      const allNodesAddresses = nodeService.getAllNodesAddresses();
      expect(allNodesAddresses).toEqual([myNodeAddress, nodeAddress]);
    });
  });

  describe('addNodeAddress', () => {
    test('Add node if unique address', () => {
      const nodeAddress = {
        address: 'testAddress',
        normalConnectionPort: '1',
        quantumConnectionPort: '2'
      };
      nodeService.addNodeAddress(nodeAddress);
      const contiguousNodesAddresses = nodeService.getContiguousNodesAddresses();
      expect(contiguousNodesAddresses).toEqual([nodeAddress]);
    });

    test("Don't add node if not unique address", () => {
      const nodeAddress = {
        address: 'testAddress',
        normalConnectionPort: '1',
        quantumConnectionPort: '2'
      };
      nodeService.addNodeAddress(nodeAddress);
      nodeService.addNodeAddress(nodeAddress);
      const contiguousNodesAddresses = nodeService.getContiguousNodesAddresses();
      expect(contiguousNodesAddresses).toEqual([nodeAddress]);
    });
  });

  describe('getNodesFromBootstrap', () => {
    beforeAll(() => server.listen());
    afterAll(() => server.close());

    test('Get addresses from bootstrap node', async () => {
      await nodeService.getNodesFromBootstrap();
      const nodesFromBootstrap = [
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
      ];
      const contiguousNodesAddresses = nodeService.getContiguousNodesAddresses();
      expect(contiguousNodesAddresses).toEqual(nodesFromBootstrap);
    });
  });
});
