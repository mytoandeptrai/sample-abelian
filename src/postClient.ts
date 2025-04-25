/* eslint-disable @typescript-eslint/no-explicit-any */
type RpcResponse<T> = {
  result: T;
  error?: any;
  id: string;
};

const RPC_USER = "NqoxGc4BWET15tYH47mZ3sq02YY=";
const RPC_PASS = "0JbF48QFBzmX+nP+4W1M5oaExvc=";

const BASE_URL = "/abewalletmlp";

interface RPCResponse {
  jsonrpc?: string;
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}
const makeRpcCall = async <T = any>(method: string, params: any[] = []): Promise<RpcResponse<T>> => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(`${RPC_USER}:${RPC_PASS}`),
    },
    body: JSON.stringify({
      jsonrpc: "1.0",
      method,
      params,
      id: "1",
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

export async function getWalletInfo(): Promise<RPCResponse> {
  return await makeRpcCall("getwalletinfo");
}

export async function getBalances(): Promise<RPCResponse> {
  return await makeRpcCall("getbalancesabe");
}

export async function walletIsLocked(): Promise<RPCResponse> {
  return await makeRpcCall("walletislocked");
}

export async function unlockWallet(): Promise<RPCResponse> {
  return await makeRpcCall("walletunlock", ["Advanced@123", 600]);
}

export async function listUnconfirmedTxs(): Promise<RPCResponse> {
  return await makeRpcCall("listunconfirmedtxs");
}

export async function listConfirmedTxs(): Promise<RPCResponse> {
  return await makeRpcCall("listconfirmedtxs");
}

export async function generateAddress(): Promise<RPCResponse> {
  return await makeRpcCall("generateaddressabe", [1]);
}

export async function listAutcoins(): Promise<RPCResponse> {
  return await makeRpcCall("listautcoins");
}

export async function listUnSpentWallets(address: string): Promise<RPCResponse> {
  return await makeRpcCall("listunspent", [1, 9999999, [address]]);
}

export async function listAddressTransactions(addresses: string[]): Promise<RPCResponse> {
  return await makeRpcCall("listaddresstransactions", [addresses]);
}

export async function getBalance(): Promise<RPCResponse> {
  return await makeRpcCall("getbalance", ["", 1]);
}

export async function buildTransaction(payload: any[]): Promise<RPCResponse> {
  return await makeRpcCall("sendtoaddressesabe", [payload]);
}
