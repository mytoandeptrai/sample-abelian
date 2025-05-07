import { useState, useEffect } from 'react'
import './App.css'
import { AddressTab } from './components/AddressTab'
import { WalletTab } from './components/WalletTab'
import { TransactionsTab } from './components/TransactionsTab'
import { PasswordModal } from './components/PasswordModal'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AddressProvider } from './components/AddressContext';

type Tab = 'address' | 'wallet' | 'transactions'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('wallet')
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [walletPassword, setWalletPassword] = useState<string | null>(null)

  useEffect(() => {
    const storedPassword = sessionStorage.getItem('walletPassword')
    if (storedPassword) {
      setWalletPassword(storedPassword)
    } else {
      setIsPasswordModalOpen(true)
    }
  }, [])

  const handlePasswordSuccess = () => {
    const storedPassword = sessionStorage.getItem('walletPassword')
    setWalletPassword(storedPassword)
  }

  return (
    <AddressProvider>
      <div className="app-container">
        <h1>Abelian Wallet</h1>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            Address
          </button>
          <button
            className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            Wallet
          </button>
          <button
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
        </div>

        <div className="tab-content-container">
          {activeTab === 'address' && <AddressTab walletPassword={walletPassword} />}
          {activeTab === 'wallet' && <WalletTab walletPassword={walletPassword} />}
          {activeTab === 'transactions' && <TransactionsTab walletPassword={walletPassword} />}
        </div>

        <PasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSuccess={handlePasswordSuccess}
          setIsPasswordModalOpen={setIsPasswordModalOpen}
        />
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </AddressProvider>
  )
}

export default App
