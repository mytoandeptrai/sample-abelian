import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AddressContextType {
  longAddress: string;
  setLongAddress: (addr: string) => void;
  shortAddress: string;
  setShortAddress: (addr: string) => void;
  generatedAddresses: string[];
  setGeneratedAddresses: (addrs: string[]) => void;
  clearAll: () => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [longAddress, setLongAddress] = useState('');
  const [shortAddress, setShortAddress] = useState('');
  const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([]);

  const clearAll = () => {
    setLongAddress('');
    setShortAddress('');
    setGeneratedAddresses([]);
  };

  return (
    <AddressContext.Provider value={{ longAddress, setLongAddress, shortAddress, setShortAddress, generatedAddresses, setGeneratedAddresses, clearAll }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddressContext = () => {
  const context = useContext(AddressContext);
  if (!context) throw new Error('useAddressContext must be used within AddressProvider');
  return context;
}; 