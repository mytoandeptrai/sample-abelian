import { useState, useEffect } from "react";
import { listConfirmedTxs, getRawTransaction } from "../postClient";

interface TransactionsTabProps {
   walletPassword: string | null;
}

type TransactionWithHash = {
   timestamp: number;
   transactionId: string;
   fee: number;
   status: "confirmed" | "unknown";
};

const formatCurrency = (amount: number): string => {
   return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 7,
      maximumFractionDigits: 7,
   }).format(amount);
};

export const TransactionsTab = ({ walletPassword }: TransactionsTabProps) => {
   const [transactions, setTransactions] = useState<TransactionWithHash[]>([]);
   const [isLoading, setIsLoading] = useState(false);

   const formatAddress = (address: string): string => {
      if (!address) return "";
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
                     return txResponse?.result;
                  } catch (error) {
                     console.error(
                        `Error fetching transaction ${txHash}:`,
                        error
                     );
                     return null;
                  }
               })
            );
            console.log('🚀 ~ fetchTransactions ~ txDetails:', txDetails);
            const validTransactions = txDetails
               .filter((tx) => tx !== null)
               .map((tx) => ({
                  timestamp: (tx as Record<string, unknown>)["time"] as number,
                  transactionId: (tx as Record<string, unknown>)[
                     "txid"
                  ] as string,
                  fee: (tx as Record<string, unknown>)["fee"] as number,
                  status: (tx as Record<string, unknown>)["blockhash"]
                     ? "confirmed"
                     : "unknown",
               })) as TransactionWithHash[];
            validTransactions.sort((a, b) => b.timestamp - a.timestamp);
            setTransactions(validTransactions);
         }
      } catch (error) {
         console.error("Error fetching transactions:", error);
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
                  {isLoading ? "Refreshing..." : "Refresh"}
               </button>
            </div>

            <div className="transactions-table-container">
               {isLoading ? (
                  <div className="loading-spinner" style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>
               ) : transactions.length > 0 ? (
                  <table className="transactions-table">
                     <thead>
                        <tr>
                           <th>Timestamp</th>
                           <th>Transaction ID</th>
                           <th>Fee</th>
                           <th>Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {transactions.map((tx) => (
                           <tr key={tx.transactionId}>
                              <td>
                                 {new Date(
                                    tx.timestamp * 1000
                                 ).toLocaleString()}
                              </td>
                              <td>
                                 <a
                                    href={`https://testnet-explorer.pqabelian.io/tx/${tx.transactionId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="explorer-link"
                                 >
                                    {formatAddress(tx.transactionId)}
                                 </a>
                              </td>
                              <td>{formatCurrency(tx.fee)}</td>
                              <td>
                                 <span className={`status-badge ${tx.status}`}>
                                    {tx.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               ) : (
                  <p>No transactions found</p>
               )}
            </div>
         </div>
      </div>
   );
};
