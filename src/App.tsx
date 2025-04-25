import { useState, useEffect } from 'react'
import './App.css'
import { unlockWallet, generateAddress, getBalances, buildTransaction, walletIsLocked, listConfirmedTxs } from './postClient'
import { AbelianAddressConverter } from './server'

function convertABEtoNeutrino(amount: number): number {
  return Math.round(amount * 10_000_000)
}

function formatAddress(address: string): string {
  if (!address) return ''
  if (address.length <= 20) return address
  return `${address.slice(0, 10)}...${address.slice(-10)}`
}

function App() {
  const [longAddress, setLongAddress] = useState('')
  const [shortAddress, setShortAddress] = useState('')
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([])
  const [balances, setBalances] = useState({
    total: 0,
    available: 0,
    pending: 0
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [transferForm, setTransferForm] = useState({
    recipient: '',
    amount: ''
  })

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const response = await getBalances()
        if (response?.result) {
          setBalances({
            total: response.result.total_balance ?? 0,
            available: response.result.spendable_balance ?? 0,
            pending: response.result.unconfirmed_balance ?? 0
          })
        }
      } catch (error) {
        console.error('Error fetching balances:', error)
      }
    }

    const fetchTransactions = async () => {
      try {
        const response = await listConfirmedTxs()
        if (response?.result) {
          setTransactions(response.result)
        }
      } catch (error) {
        console.error('Error fetching transactions:', error)
      }
    }

    fetchBalances()
    fetchTransactions()
  }, [])

  const handleGenerateAddress = async () => {
    try {
      setIsGenerating(true)
      const unlockWalletResponse = await unlockWallet()
      if (!unlockWalletResponse?.error) {
        const generateAddressResponse = await generateAddress()
        if (generateAddressResponse?.result) {
          const generatedAddress = generateAddressResponse?.result[0]?.addr
          setLongAddress(generatedAddress)
          setGeneratedAddresses(prev => [...prev, generatedAddress])
          console.log('Generated Address:', generatedAddress)
        }
      }
    } catch (error) {
      console.error('Error generating address:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConvertAddress = async () => {
    if (!longAddress) return
    
    try {
      setIsConverting(true)
      const shortAddr = await AbelianAddressConverter.longToShort(longAddress)
      setShortAddress(shortAddr)
    } catch (error) {
      console.error('Error converting address:', error)
    } finally {
      setIsConverting(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferForm.recipient || !transferForm.amount) return

    try {
      setIsTransferring(true)
      const address = await AbelianAddressConverter.toLongAddress(transferForm.recipient)
      const payload = [{
        address,
        amount: convertABEtoNeutrino(Number(transferForm.amount))
      }]

      const isLocked = await walletIsLocked()
      if (isLocked && isLocked.result) {
        const unlockWalletResponse = await unlockWallet()
        if (!unlockWalletResponse?.error) {
          const buildTransactionResponse = await buildTransaction(payload)
          console.log('Transfer response:', buildTransactionResponse)
        }
      } else {
        const buildTransactionResponse = await buildTransaction(payload)
        console.log('Transfer response:', buildTransactionResponse)
      }

      setTransferForm({ recipient: '', amount: '' })
    } catch (error) {
      console.error('Error transferring:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="app-container">
      <h1>Abelian Operations</h1>
      
      <div className="grid-container">
        {/* Create Address Section */}
        <div className="grid-item">
          <h2>Create Address</h2>
          <button 
            className="action-button" 
            onClick={handleGenerateAddress}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate New Address'}
          </button>
          {longAddress && (
            <div className="result">
              <p title={longAddress}>Generated Address: {formatAddress(longAddress)}</p>
            </div>
          )}
          {generatedAddresses.length > 0 && (
            <div className="generated-addresses">
              <h3>Generated Addresses History:</h3>
              <ul>
                {generatedAddresses.map((addr, index) => (
                  <li key={index}>{(addr)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Convert Address Section */}
        <div className="grid-item">
          <h2>Convert Address</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter long address"
              value={longAddress}
              onChange={(e) => setLongAddress(e.target.value)}
            />
            <button 
              className="action-button"
              onClick={handleConvertAddress}
              disabled={isConverting || !longAddress}
            >
              {isConverting ? 'Converting...' : 'Convert to Short'}
            </button>
            <div className="result">
              <p>Short Address: {shortAddress || 'Not converted yet'}</p>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="grid-item">
          <h2>Wallet Information</h2>
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
          <button className="action-button">Refresh Balances</button>
        </div>

        {/* Transfer Section */}
        <div className="grid-item">
          <h2>Transfer</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="Recipient address"
              value={transferForm.recipient}
              onChange={(e) => setTransferForm(prev => ({ ...prev, recipient: e.target.value }))}
            />
            <input
              type="number"
              placeholder="Amount"
              value={transferForm.amount}
              onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
            />
            <div className="button-group">
              <button 
                className="action-button"
                onClick={() => setTransferForm({ recipient: '', amount: '' })}
              >
                Clear
              </button>
              <button 
                className="action-button"
                onClick={handleTransfer}
                disabled={isTransferring || !transferForm.recipient || !transferForm.amount}
              >
                {isTransferring ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="grid-item">
          <h2>Transactions</h2>
          <div className="transactions-list">
            {transactions.length > 0 ? (
              <ul>
                {transactions.map((tx, index) => (
                  <li key={index} className="transaction-item">
                    <div className="transaction-header">
                      <span>Tx ID: {formatAddress(tx.txid)}</span>
                      <span>Amount: {tx.amount}</span>
                    </div>
                    <div className="transaction-details">
                      <p>From: {formatAddress(tx.from)}</p>
                      <p>To: {formatAddress(tx.to)}</p>
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
    </div>
  )
}

export default App
