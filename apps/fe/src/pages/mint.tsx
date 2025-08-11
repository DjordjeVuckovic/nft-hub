import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Mint() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<number | null>(null)
  const [mintingFee] = useState('0.005 ETH')

  // Sample NFT metadata (10 predefined NFTs)
  const nftOptions = [
    { id: 1, name: 'Cosmic Dragon', description: 'A mystical dragon from the cosmos' },
    { id: 2, name: 'Digital Phoenix', description: 'Rising from digital ashes' },
    { id: 3, name: 'Cyber Wolf', description: 'Guardian of the digital realm' },
    { id: 4, name: 'Crystal Unicorn', description: 'Pure magic crystallized' },
    { id: 5, name: 'Shadow Panther', description: 'Stealth incarnate' },
    { id: 6, name: 'Golden Eagle', description: 'Soaring through golden skies' },
    { id: 7, name: 'Electric Tiger', description: 'Power and lightning combined' },
    { id: 8, name: 'Ocean Dolphin', description: 'Grace of the digital seas' },
    { id: 9, name: 'Forest Spirit', description: 'Ancient wisdom of nature' },
    { id: 10, name: 'Fire Salamander', description: 'Born from eternal flames' }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Mint NFT</h1>
            <p className="text-muted-foreground">
              Choose from our collection of pre-designed NFTs to mint
            </p>
          </div>

          {!isRegistered ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Registration Required</h3>
              <p className="text-muted-foreground mb-6">
                You must be a registered user to mint NFTs
              </p>
              <div className="space-x-4">
                <Link 
                  to="/register"
                  className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Register Now
                </Link>
                <button 
                  onClick={() => setIsRegistered(true)}
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  I'm Already Registered
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Select NFT to Mint</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {nftOptions.map((nft) => (
                    <div
                      key={nft.id}
                      onClick={() => setSelectedNFT(nft.id)}
                      className={`cursor-pointer border rounded-lg p-4 transition-all hover:bg-muted/50 ${
                        selectedNFT === nft.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center border border-border">
                        <span className="text-muted-foreground text-sm">#{nft.id}</span>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{nft.name}</h4>
                      <p className="text-xs text-muted-foreground">{nft.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNFT && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Mint Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium">{nftOptions[selectedNFT - 1].name}</h4>
                        <p className="text-sm text-muted-foreground">{nftOptions[selectedNFT - 1].description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Minting Fee</p>
                        <p className="font-medium">{mintingFee}</p>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        💡 This NFT will be minted to your connected wallet address and stored on IPFS
                      </p>
                    </div>

                    <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      Mint NFT for {mintingFee}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}