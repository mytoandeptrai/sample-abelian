import { useState, useEffect } from "react";
import {
   getBalances,
   buildTransaction,
   walletIsLocked,
   unlockWallet,
} from "../postClient";
import { AbelianAddressConverter } from "../server";
import { Balance, TransferForm } from "../types";
import { toast } from "react-toastify";

interface WalletTabProps {
   walletPassword: string | null;
}

export const WalletTab = ({ walletPassword }: WalletTabProps) => {
   const [balances, setBalances] = useState<Balance>({
      total: 0,
      available: 0,
      pending: 0,
   });
   const [isRefreshing, setIsRefreshing] = useState(false);
   const [isTransferring, setIsTransferring] = useState(false);
   const [transferForm, setTransferForm] = useState<TransferForm>({
      recipient: "",
      amount: "",
   });

   const fetchBalances = async () => {
      try {
         setIsRefreshing(true);
         const response = await getBalances();
         if (response?.result) {
            setBalances({
               total: response.result.total_balance ?? 0,
               available: response.result.spendable_balance ?? 0,
               pending: response.result.unconfirmed_balance ?? 0,
            });
         }
      } catch (error) {
         console.error("Error fetching balances:", error);
      } finally {
         setIsRefreshing(false);
      }
   };

   useEffect(() => {
      fetchBalances();
   }, []);

   const convertABEtoNeutrino = (amount: number): number => {
      return Math.round(amount * 10_000_000);
   };

   const buildAndHandleTransaction = async (
      payload: {
         address: string;
         amount: number;
      }[]
   ) => {
      const buildTransactionResponse = await buildTransaction(payload);
      if (buildTransactionResponse?.error) {
         toast.error("Failed to build transaction.");
         return false;
      }
      await fetchBalances();
      toast.success("Transfer successful!");
      return true;
   };

   const handleTransfer = async () => {
      if (!transferForm.recipient || !transferForm.amount || !walletPassword)
         return;

      setIsTransferring(true);
      try {
         const address = await AbelianAddressConverter.toLongAddress(
            transferForm.recipient
         );
         const payload = [
            {
               address,
               amount: convertABEtoNeutrino(Number(transferForm.amount)),
            },
         ];

         const isLocked = await walletIsLocked();
         if (isLocked && isLocked.result) {
            const unlockWalletResponse = await unlockWallet(walletPassword);
            if (unlockWalletResponse?.error) {
               toast.error("Failed to unlock wallet.");
               return;
            }
         }
         await buildAndHandleTransaction(payload);
         setTransferForm({ recipient: "", amount: "" });
      } catch (error) {
         console.error("Error transferring:", error);
         toast.error("Transfer failed!");
      } finally {
         setIsTransferring(false);
      }
   };

   return (
      <div className="tab-content">
         <div className="section">
            <h3>Wallet Information</h3>
            <div className="balance-container">
               <div className="balance-item">
                  <label>Total Balance</label>
                  <div className="balance-value">{balances.total}</div>
               </div>
               <div className="balance-item">
                  <label>Available Balance</label>
                  <div className="balance-value">{balances.available}</div>
               </div>
               <div className="balance-item">
                  <label>Pending Balance</label>
                  <div className="balance-value">{balances.pending}</div>
               </div>
            </div>
            <button
               className="action-button"
               onClick={fetchBalances}
               disabled={isRefreshing}
            >
               {isRefreshing ? "Refreshing..." : "Refresh Balances"}
            </button>
         </div>

         <div className="section">
            <h3>Transfer</h3>
            <div className="input-group">
               <input
                  type="text"
                  placeholder="Recipient address"
                  value={transferForm.recipient}
                  onChange={(e) =>
                     setTransferForm((prev) => ({
                        ...prev,
                        recipient: e.target.value,
                     }))
                  }
               />
               <input
                  type="number"
                  placeholder="Amount"
                  value={transferForm.amount}
                  onChange={(e) =>
                     setTransferForm((prev) => ({
                        ...prev,
                        amount: e.target.value,
                     }))
                  }
               />
               <div className="button-group">
                  <button
                     className="action-button"
                     onClick={() =>
                        setTransferForm({ recipient: "", amount: "" })
                     }
                  >
                     Clear
                  </button>
                  <button
                     className="action-button"
                     onClick={handleTransfer}
                     disabled={
                        isTransferring ||
                        !transferForm.recipient ||
                        !transferForm.amount ||
                        !walletPassword
                     }
                  >
                     {isTransferring ? "Transferring..." : "Transfer"}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};
