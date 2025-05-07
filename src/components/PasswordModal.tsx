import { useState, useEffect } from 'react';
import { unlockWallet, walletIsLocked } from '../postClient';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  setIsPasswordModalOpen: (isOpen: boolean) => void;
}

export const PasswordModal = ({ isOpen, onClose, onSuccess, setIsPasswordModalOpen }: PasswordModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add interval to check wallet lock status
  useEffect(() => {
    const checkWalletLock = async () => {
      try {
        const response = await walletIsLocked();
        if (response.result === true) {
          // If wallet is locked, show modal
          onClose();
          setIsPasswordModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking wallet lock status:', error);
      }
    };

    // Check every 10 seconds
    const interval = setInterval(checkWalletLock, 10000);
    return () => clearInterval(interval);
  }, [onClose, setIsPasswordModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First try to unlock the wallet
      const unlockResponse = await unlockWallet(password);
      
      if (unlockResponse.error || unlockResponse.result === false) {
        setError('Invalid password. Please try again.');
        return;
      }

      // If unlock successful, store password in sessionStorage
      sessionStorage.setItem('walletPassword', password);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error during wallet unlock:', error);
      setError('Failed to unlock wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Welcome to Abelian Wallet</h2>
          <p className="modal-subtitle">Please enter your wallet password to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="password">
              <span className="label-text">Wallet Password</span>
              <div className="password-input-container">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your wallet password"
                  required
                  className={error ? 'input-error' : ''}
                />
                {error && (
                  <div className="error-icon" title={error}>
                    ⚠️
                  </div>
                )}
              </div>
            </label>
            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button 
              type="submit" 
              disabled={isLoading || !password.trim()}
              className="modal-button primary"
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Unlocking...
                </span>
              ) : (
                'Unlock Wallet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 