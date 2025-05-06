import { useState } from 'react';
import { generateAddress } from '../postClient';
import { AbelianAddressConverter } from '../server';

interface AddressTabProps {
  walletPassword: string | null;
}

export const AddressTab = ({ walletPassword }: AddressTabProps) => {
  const [longAddress, setLongAddress] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerateAddress = async () => {
    if (!walletPassword) return;
    
    try {
      setIsGenerating(true);
      const generateAddressResponse = await generateAddress();
      if (generateAddressResponse?.result) {
        const generatedAddress = generateAddressResponse.result[0]?.addr;
        setLongAddress(generatedAddress);
        setGeneratedAddresses(prev => [...prev, generatedAddress]);
      }
    } catch (error) {
      console.error('Error generating address:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertAddress = async () => {
    if (!longAddress) return;
    
    try {
      setIsConverting(true);
      const shortAddr = await AbelianAddressConverter.longToShort(longAddress);
      setShortAddress(shortAddr);
    } catch (error) {
      console.error('Error converting address:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatAddress = (address: string): string => {
    if (!address) return '';
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const handleCopy = async (address: string, index: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // fallback or error
    }
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h3>Generate New Address</h3>
        <button 
          className="action-button" 
          onClick={handleGenerateAddress}
          disabled={isGenerating || !walletPassword}
        >
          {isGenerating ? 'Generating...' : 'Generate New Address'}
        </button>
        {longAddress && (
          <div className="result">
            <p className="address-display" title={longAddress}>Generated Address: {formatAddress(longAddress)}</p>
          </div>
        )}
      </div>

      <div className="section">
        <h3>Convert Address</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter long address"
            value={longAddress}
            onChange={(e) => setLongAddress(e.target.value)}
            className="address-input"
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

      {generatedAddresses.length > 0 && (
        <div className="section">
          <h3>Generated Addresses History</h3>
          <ul className="address-list">
            {generatedAddresses.map((addr, index) => (
              <li key={index} className="address-history-item" title={addr}>
                <span className="address-history-long">{formatAddress(addr)}</span>
                <button
                  className="copy-btn"
                  onClick={() => handleCopy(addr, index)}
                  aria-label="Copy address"
                >
                  {copiedIndex === index ? '✅' : '📋'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 