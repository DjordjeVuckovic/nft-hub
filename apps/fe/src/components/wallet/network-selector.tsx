import { useState } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Loader2, Globe, TestTube } from 'lucide-react'
import { NETWORKS, getMainnetNetworks, getTestnetNetworks } from '@/config/networks'

type NetworkSelectorProps = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function NetworkSelector({ variant = 'outline', size = 'default' }: NetworkSelectorProps) {
  const { currentNetwork, switchNetwork, isSwitchingNetwork, isConnected } = useWallet()
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)

  const handleNetworkSwitch = async (networkId: string) => {
    const network = NETWORKS[networkId]
    if (network) {
      setSelectedNetwork(networkId)
      try {
        await switchNetwork(network)
      } catch (error) {
        console.error('Failed to switch network:', error)
      } finally {
        setSelectedNetwork(null)
      }
    }
  }

  const mainnetNetworks = getMainnetNetworks()
  const testnetNetworks = getTestnetNetworks()

  const isLoading = isSwitchingNetwork || selectedNetwork !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={!isConnected || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Switching...
            </>
          ) : (
            <>
              <div className={`w-2 h-2 rounded-full ${
                currentNetwork 
                  ? currentNetwork.testnet 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                  : 'bg-gray-400'
              }`} />
              <span className="hidden sm:inline">
                {currentNetwork?.shortName || 'Select Network'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Mainnet Networks
        </DropdownMenuLabel>
        {mainnetNetworks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleNetworkSwitch(network.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{network.shortName}</span>
            </div>
            {currentNetwork?.id === network.id && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          Testnet Networks
        </DropdownMenuLabel>
        {testnetNetworks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleNetworkSwitch(network.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>{network.shortName}</span>
            </div>
            {currentNetwork?.id === network.id && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}