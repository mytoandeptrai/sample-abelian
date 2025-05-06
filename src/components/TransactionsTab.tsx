import { useState, useEffect } from 'react';
import { listConfirmedTxs, getRawTransaction } from '../postClient';
import { Transaction } from '../types';

interface TransactionsTabProps {
  walletPassword: string | null;
}

type TransactionWithHash = Transaction & {
  hash: string;
};

export const TransactionsTab = ({ walletPassword }: TransactionsTabProps) => {
  const [transactions, setTransactions] = useState<TransactionWithHash[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const fetchTransactions = async () => {
    if (!walletPassword) return;

    try {
      setIsLoading(true);
      const response = await listConfirmedTxs();
      if (response?.result) {
        const txHashes = response.result;
        console.log('🚀 ~ fetchTransactions ~ txHashes:', txHashes);
        const txDetails = await Promise.all(
          txHashes.map(async (txHash: string) => {
            try {
              const txResponse = await getRawTransaction(txHash);
              console.log('🚀 ~ txHashes.map ~ txResponse:', txResponse);
              return txResponse?.result;
            } catch (error) {
              console.error(`Error fetching transaction ${txHash}:`, error);
              return null;
            }
          })
        );
        const validTransactions = txDetails
          .filter((tx): tx is Record<string, unknown> => tx !== null)
          .map((tx) => ({
            txid: (tx as Record<string, unknown>)["txid"] as string,
            hash: (tx as Record<string, unknown>)["hash"] as string,
            timestamp: (tx as Record<string, unknown>)["time"] as number,
            confirmations: (tx as Record<string, unknown>)["confirmations"] as number,
            amount: (tx as Record<string, unknown>)["amount"] ?? 'N/A',
            from: 'N/A',
            to: 'N/A'
          })) as TransactionWithHash[];
        setTransactions(validTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [walletPassword]);

  return (
    <div className="tab-content">
      <div className="section">
        <div className="section-header">
          <h3>Transaction History</h3>
          <button 
            className="action-button"
            onClick={fetchTransactions}
            disabled={isLoading || !walletPassword}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="transactions-list">
          {transactions.length > 0 ? (
            <ul>
              {transactions.map((tx) => (
                <li key={tx.txid} className="transaction-item">
                  <div className="transaction-header">
                    <span>Tx ID: {formatAddress(tx.txid)}</span>
                    <span>Amount: {tx.amount}</span>
                  </div>
                  <div className="transaction-details">
                    <p>From: {formatAddress(tx.from)}</p>
                    <p>To: {formatAddress(tx.to)}</p>
                    <p>Time: {new Date(tx.timestamp * 1000).toLocaleString()}</p>
                    <p>Confirmations: {tx.confirmations}</p>
                    <p>
                      <a
                        href={`https://testnet-explorer.pqabelian.io/block/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="explorer-link"
                      >
                        View on Explorer
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions found</p>
          )}
        </div>
      </div>
    </div>
  );
}; 
