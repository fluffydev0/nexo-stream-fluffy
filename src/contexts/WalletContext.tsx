import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useStellar } from './StellarContext';

interface WalletContextType {
  publicKey: string | null;
  balance: string | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function getFreighter(): any {
  return (window as any).freighter ?? (window as any).freighterApi;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { network, horizonUrl, networkPassphrase } = useStellar();
  const [publicKey, setPublicKey] = useState<string | null>(() => {
    return localStorage.getItem('nexol_wallet_pubkey');
  });
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (key: string) => {
    try {
      const res = await fetch(`${horizonUrl}/accounts/${key}`);
      if (!res.ok) { setBalance('0.00'); return; }
      const data = await res.json();
      const native = data.balances?.find((b: any) => b.asset_type === 'native');
      const usdc = data.balances?.find((b: any) => 
        b.asset_code === 'USDC' && b.asset_type !== 'native'
      );
      // Prefer USDC, fallback to XLM
      setBalance(usdc ? Number(usdc.balance).toFixed(2) : native ? Number(native.balance).toFixed(2) : '0.00');
    } catch {
      setBalance('0.00');
    }
  }, [horizonUrl]);

  const refreshBalance = useCallback(async () => {
    if (publicKey) await fetchBalance(publicKey);
  }, [publicKey, fetchBalance]);

  useEffect(() => {
    if (publicKey) fetchBalance(publicKey);
  }, [publicKey, network, fetchBalance]);

  // Auto-reconnect on page load
  useEffect(() => {
    const saved = localStorage.getItem('nexol_wallet_pubkey');
    if (saved) {
      const freighter = getFreighter();
      if (freighter) {
        setPublicKey(saved);
      }
    }
  }, []);

  const connect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const freighter = getFreighter();
      if (!freighter) {
        setError('Freighter wallet not found. Please install Freighter browser extension.');
        setConnecting(false);
        return;
      }

      // Check if user has granted access
      const isAllowed = await freighter.isAllowed?.();
      if (!isAllowed) {
        await freighter.setAllowed?.();
      }

      const key = await freighter.getPublicKey();
      if (!key) {
        setError('Failed to get public key from Freighter');
        setConnecting(false);
        return;
      }

      // Check network
      const walletNetwork = await freighter.getNetwork?.();
      const expectedNetwork = network === 'mainnet' ? 'PUBLIC' : 'TESTNET';
      if (walletNetwork && walletNetwork !== expectedNetwork) {
        setError(`Network mismatch: Freighter is on ${walletNetwork}, but NexolPay expects ${expectedNetwork}. Please switch in Freighter settings.`);
        setConnecting(false);
        return;
      }

      setPublicKey(key);
      localStorage.setItem('nexol_wallet_pubkey', key);
      await fetchBalance(key);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to connect wallet');
    }
    setConnecting(false);
  };

  const disconnect = () => {
    setPublicKey(null);
    setBalance(null);
    localStorage.removeItem('nexol_wallet_pubkey');
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    const freighter = getFreighter();
    if (!freighter) throw new Error('Freighter not available');
    const signed = await freighter.signTransaction(xdr, {
      networkPassphrase,
      network: network === 'mainnet' ? 'PUBLIC' : 'TESTNET',
    });
    return signed;
  };

  return (
    <WalletContext.Provider value={{
      publicKey,
      balance,
      connected: !!publicKey,
      connecting,
      error,
      connect,
      disconnect,
      refreshBalance,
      signTransaction,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
