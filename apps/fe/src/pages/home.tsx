import { Link } from 'react-router-dom'
import StepCard from '../components/ui/step-card.tsx'
import { Button } from '@/components/ui/button'
import { WalletButton } from '@/components/wallet/wallet-button.tsx'
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-card-foreground">NFT Gallery</h2>
            <Link 
              to="/gallery"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-muted rounded-lg p-4 border border-border hover:border-primary/50 transition-colors">
              <div className="aspect-square bg-background rounded-lg mb-3 flex items-center justify-center border border-border">
                <span className="text-muted-foreground">NFT Preview</span>
              </div>
              <h4 className="font-medium mb-1 text-foreground">Sample NFT</h4>
              <p className="text-sm text-muted-foreground">Creator: 0x...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}