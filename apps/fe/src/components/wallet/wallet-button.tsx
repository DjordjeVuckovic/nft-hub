import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import { Wallet, LogOut, Loader2 } from 'lucide-react'

type WalletButtonProps = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function WalletButton({ variant = 'default', size = 'default', className }: WalletButtonProps) {
  const { isConnected, isConnecting, account, connect, disconnect, getShortAddress, error, isWalletAvailable } = useWallet()

  if (!isWalletAvailable()) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        Install MetaMask
      </Button>
    )
  }

  if (isConnecting) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Connecting...
      </Button>
    )
  }

  if (isConnected && account) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="outline" size={size} disabled className="flex-1">
          <Wallet className="h-4 w-4 mr-2 text-foreground" />
          <span className={'text-foreground'}>{getShortAddress(account)}</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect Wallet">
          <LogOut className="h-4 w-4 text-foreground" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Button variant={variant} size={size} onClick={connect} className="w-full">
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  )
}