import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Gallery() {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock NFT data
  const mockNFTs = [
    {
      id: 1,
      name: 'Cosmic Dragon #001',
      creator: '0x1234...5678',
      owner: '0x1234...5678',
      price: '0.1 ETH',
      image: '/placeholder-nft.jpg'
    },
    {
      id: 2,
      name: 'Digital Phoenix #002',
      creator: '0xabcd...efgh',
      owner: '0x5678...9abc',
      price: '0.05 ETH',
      image: '/placeholder-nft.jpg'
    },
    {
      id: 3,
      name: 'Cyber Wolf #003',
      creator: '0x9876...5432',
      owner: '0x9876...5432',
      price: 'Not for sale',
      image: '/placeholder-nft.jpg'
    }
  ]

  const filteredNFTs = mockNFTs.filter(nft =>
    nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nft.creator.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">NFT Gallery</h1>
              <p className="text-muted-foreground">
                Discover and explore minted NFTs from our community
              </p>
            </div>
            <Link 
              to="/mint"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Mint New NFT
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by NFT name or creator address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select className="bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary">
                  <option>All Categories</option>
                  <option>Art</option>
                  <option>Gaming</option>
                  <option>Music</option>
                </select>
                <select className="bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary">
                  <option>Sort by: Recent</option>
                  <option>Sort by: Price Low</option>
                  <option>Sort by: Price High</option>
                  <option>Sort by: Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredNFTs.map((nft) => (
              <div key={nft.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group">
                <div className="aspect-square bg-muted flex items-center justify-center border-b border-border">
                  <span className="text-muted-foreground">NFT #{nft.id}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {nft.name}
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Creator:</span>
                      <a 
                        href={`https://etherscan.io/address/${nft.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {nft.creator}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Owner:</span>
                      <a 
                        href={`https://etherscan.io/address/${nft.owner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {nft.owner}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">{nft.price}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredNFTs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">No NFTs found matching your search</p>
              <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
            </div>
          )}

          <div className="mt-8 text-center">
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