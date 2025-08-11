import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut, Loader2, Lock } from 'lucide-react'

interface WalletButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function WalletButton({ variant = 'default', size = 'default' }: WalletButtonProps) {
  const { isConnected, isConnecting, account, connect, disconnect, getShortAddress, error, isWalletAvailable } = useWallet()

  if (!isWalletAvailable()) {
    return (
      <Button variant="outline" size={size} disabled>
        Install MetaMask
      </Button>
    )
  }

  if (isConnecting) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size={size} disabled>
          <Wallet className="h-4 w-4 mr-2" />
          {getShortAddress(account)}
        </Button>
        <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect Wallet">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant={variant} size={size} onClick={connect}>
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
      {error && (
        <p className="text-xs text-red-500 max-w-48 text-right">{error}</p>
      )}
    </div>
  )
}