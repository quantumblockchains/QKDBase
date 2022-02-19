export interface NodeAddress {
  address: string;
  port: string;
}

export interface QKDGetKeyResponse {
  keys: {
    key_ID: string;
    key: string;
  }[];
}
