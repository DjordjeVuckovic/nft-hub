import { Link } from 'react-router-dom'
import StepCard from '../components/ui/step-card.tsx'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet/wallet-button.tsx'
import { NFTHomeHeader } from '@/components/nft/nft-home-header.tsx'
import { NFTPreviewGrid } from '@/components/nft/nft-preview-grid'
import { useWallet } from '@/hooks/useWallet'
import { useEthContract } from '@/hooks/useEthContract.ts'

export default function Home() {
  const { isConnected } = useWallet()
  const { isRegistered } = useEthContract()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              NFT Hub
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Register, mint, and discover unique NFTs on the blockchain
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
          <StepCard
            title="Connect Wallet"
            description="Connect your Web3 wallet to get started"
            number="0x1"
            isCompleted={isConnected}
          >
            <WalletButton variant="default" size="default" className="w-full" />
          </StepCard>

          <StepCard
            title="Register"
            description="Register as a user to mint NFTs"
            number="0x2"
            isCompleted={isRegistered}
          >
            <Button asChild variant="secondary" className="w-full">
              <Link to="/register">
                {isRegistered ? 'View Registration' : 'Register'}
              </Link>
            </Button>
          </StepCard>

          <StepCard
            title="Mint NFT"
            description="Create your unique NFT on the blockchain"
            number="0x3"
          >
            <Button 
              asChild 
              variant="secondary" 
              className="w-full"
              disabled={!isConnected || !isRegistered}
            >
              <Link to={isConnected && isRegistered ? "/mint" : "#"}>
                {!isConnected 
                  ? 'Connect Wallet First' 
                  : !isRegistered 
                    ? 'Register First' 
                    : 'Mint NFT'
                }
              </Link>
            </Button>
          </StepCard>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <NFTHomeHeader title="NFT Gallery" />
          <NFTPreviewGrid />
        </div>
      </div>
    </div>
  )
}

