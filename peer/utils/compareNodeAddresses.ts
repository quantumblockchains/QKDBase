import { NodeAddresses } from "../../shared/types";

export const compareNodeAddresses = (leftNodeAddresses: NodeAddresses, rightNodeADdresses: NodeAddresses) =>
  leftNodeAddresses.address === rightNodeADdresses.address &&
  leftNodeAddresses.normalConnectionPort === rightNodeADdresses.normalConnectionPort &&
  leftNodeAddresses.quantumConnectionPort === rightNodeADdresses.quantumConnectionPort;
  