import { useAuth } from '@/contexts/AuthContext'

export function useWallet() {
  const auth = useAuth()

  return {
    // Wallet connection state
    isConnected: auth.isConnected,
    isConnecting: auth.isConnecting,
    account: auth.account,
    provider: auth.provider,
    signer: auth.signer,
    error: auth.error,

    // Network state
    currentNetwork: auth.currentNetwork,
    isSwitchingNetwork: auth.isSwitchingNetwork,

    // Wallet actions
    connect: auth.connectWallet,
    disconnect: auth.disconnectWallet,

    // Network actions
    switchNetwork: auth.switchNetwork,
    getCurrentNetwork: auth.getCurrentNetwork,

    // Utility functions
    getShortAddress: (address?: string | null) => {
      const addr = address || auth.account
      if (!addr) return null
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    },

    // Check if wallet is available
    isWalletAvailable: () => {
      return typeof window !== 'undefined' && !!window.ethereum
    },
  }
}