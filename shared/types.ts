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

export interface QRNGGetRandomArrayResponse {
  data: {
      result: number[];
      QuantisRead: number;
      ExecuteTime: string;
  },
  error: string;
  message: string;
  timestamp: string;
  status: number;
}
