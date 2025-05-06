export interface Transaction {
  txid: string;
  amount: number;
  from: string;
  to: string;
  timestamp: number;
  confirmations: number;
}

export interface WalletState {
  isLocked: boolean;
  password: string | null;
}

export interface Balance {
  total: number;
  available: number;
  pending: number;
}

export interface TransferForm {
  recipient: string;
  amount: string;
} 