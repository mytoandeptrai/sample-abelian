import { useState } from 'react';
import { generateAddress } from '../postClient';
import { AbelianAddressConverter } from '../server';
import { toast } from 'react-toastify';
import { useAddressContext } from './AddressContext';

interface AddressTabProps {
  walletPassword: string | null;
}

export const AddressTab = ({ walletPassword }: AddressTabProps) => {
  const {
    longAddress,
    setLongAddress,
    shortAddress,
    setShortAddress,
    generatedAddresses,
    setGeneratedAddresses,
    clearAll
  } = useAddressContext();
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
        setGeneratedAddresses([...generatedAddresses, generatedAddress]);
        toast.success('Address generated successfully!');
      }
    } catch (error) {
      console.error('Error generating address:', error);
      toast.error('Failed to generate address!');
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
      toast.success('Address converted successfully!');
    } catch (error) {
      console.error('Error converting address:', error);
      toast.error('Failed to convert address!');
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
          {isGenerating
            ? 'Generating...'
            : longAddress
              ? 'Generate Another New Address'
              : 'Generate New Address'}
        </button>
        <button
          className="action-button"
          style={{ marginLeft: 8 }}
          onClick={clearAll}
          disabled={isGenerating && isConverting}
        >
          Clear All
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
            <p>
              Short Address: {shortAddress || 'Not converted yet'}
              {shortAddress && (
                <button
                  className="copy-btn"
                  style={{ marginLeft: 8 }}
                  onClick={async () => {
                    await navigator.clipboard.writeText(shortAddress);
                    toast.success('Copied short address!');
                  }}
                  aria-label="Copy short address"
                >
                  ⧉
                </button>
              )}
            </p>
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
                  {copiedIndex === index ? '✅' : '⧉'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 