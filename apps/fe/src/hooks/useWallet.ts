import { useAuth } from '@/contexts/auth-context.tsx'
import {shortenAddress} from "@/util/strings.ts";

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

    getShortAddress: (address?: string | null) => shortenAddress(address || auth.account),

    isWalletAvailable: () => {
      return typeof window !== 'undefined' && !!window.ethereum
    },

		getEthScanUrl: (address?: string | null) => {
			switch (auth.currentNetwork?.name) {
				case 'ethereum':
					return `https://etherscan.io/address/${address}`;
				case 'goerli':
					return `https://goerli.etherscan.io/address/${address}`;
				case 'sepolia':
					return `https://sepolia.etherscan.io/address/${address}`;
				default:
					return `https://etherscan.io/address/${address}`;
			}
		}
  }
}