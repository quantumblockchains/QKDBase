import { NodeAddress } from '../../shared/types';

export const compareNodeAddresses = (leftNodeAddresses: NodeAddress, rightNodeADdresses: NodeAddress) =>
	leftNodeAddresses.address === rightNodeADdresses.address &&
  leftNodeAddresses.port === rightNodeADdresses.port;
  
