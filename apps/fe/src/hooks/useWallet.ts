import { useAuth } from '@/contexts/auth-context.tsx'

export function useWallet() {
  const auth = useAuth()

  return {
    isConnected: auth.isConnected,
    isConnecting: auth.isConnecting,
    account: auth.account,
    provider: auth.provider,
    signer: auth.signer,
    error: auth.error,

    currentNetwork: auth.currentNetwork,
    isSwitchingNetwork: auth.isSwitchingNetwork,

    connect: auth.connectWallet,
    disconnect: auth.disconnectWallet,

    switchNetwork: auth.switchNetwork,
    getCurrentNetwork: auth.getCurrentNetwork,

    getShortAddress: (address?: string | null) => {
      const addr = address || auth.account
      if (!addr) return null
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    },

    isWalletAvailable: () => {
      return typeof window !== 'undefined' && !!window.ethereum
    },
  }
}