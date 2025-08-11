import { Link } from 'react-router-dom'

export default function Home() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Connect Wallet</h3>
            <p className="text-muted-foreground mb-4">Connect your Web3 wallet to get started</p>
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Connect Wallet
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Register</h3>
            <p className="text-muted-foreground mb-4">Register as a user to mint NFTs</p>
            <Link 
              to="/register"
              className="block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              Register
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors">
            <h3 className="text-xl font-semibold mb-3 text-card-foreground">Mint NFT</h3>
            <p className="text-muted-foreground mb-4">Create your unique NFT on the blockchain</p>
            <Link 
              to="/mint"
              className="block w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              Mint NFT
            </Link>
          </div>
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