import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StellarNetwork = 'mainnet' | 'testnet';

interface StellarConfig {
  network: StellarNetwork;
  horizonUrl: string;
  networkPassphrase: string;
  explorerBaseUrl: string;
  setNetwork: (network: StellarNetwork) => void;
}

const CONFIGS: Record<StellarNetwork, Omit<StellarConfig, 'network' | 'setNetwork'>> = {
  mainnet: {
    horizonUrl: 'https://horizon.stellar.org',
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
    explorerBaseUrl: 'https://stellar.expert/explorer/public',
  },
  testnet: {
    horizonUrl: 'https://horizon-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    explorerBaseUrl: 'https://stellar.expert/explorer/testnet',
  },
};

const StellarContext = createContext<StellarConfig | undefined>(undefined);

export function StellarProvider({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<StellarNetwork>(() => {
    const saved = localStorage.getItem('nexol_stellar_network');
    return (saved === 'mainnet' || saved === 'testnet') ? saved : 'mainnet';
  });

  useEffect(() => {
    localStorage.setItem('nexol_stellar_network', network);
  }, [network]);

  const config = CONFIGS[network];

  return (
    <StellarContext.Provider value={{ network, ...config, setNetwork }}>
      {children}
    </StellarContext.Provider>
  );
}

export function useStellar() {
  const ctx = useContext(StellarContext);
  if (!ctx) throw new Error('useStellar must be used within StellarProvider');
  return ctx;
}
