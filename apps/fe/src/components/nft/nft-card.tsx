import { useState } from 'react'
import type { NFT } from '@/types/nft'
import { useEthContract } from '@/hooks/useEthContract.ts'
import { getNftImage } from '@/api/nfts-api'

interface NFTCardProps {
  nft: NFT
  onMintSuccess?: () => void
}

export function NFTCard({ nft, onMintSuccess }: NFTCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { mint, isRegistered, mintingFee } = useEthContract()

  const handleMint = async () => {
    if (!isRegistered || nft.isMinted) return

    setIsLoading(true)
    try {
      const result = await mint(nft.index)
      if (result.success) {
        onMintSuccess?.()
      } else {
        console.error('Mint failed:', result.error)
      }
    } catch (error) {
      console.error('Mint error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-200 hover:shadow-lg group flex flex-col h-full">
      {/* Image Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {nft.metadata?.image && !imageError ? (
          <img 
            src={getNftImage(nft.metadata.image)} 
            alt={nft.metadata.name || 'NFT'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl">🖼️</span>
              </div>
              <span className="text-muted-foreground text-sm">NFT #{nft.index + 1}</span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            nft.isMinted 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
          }`}>
            {nft.isMinted ? 'Minted' : 'Available'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-semibold text-lg pb-2 text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {nft.metadata?.name || `NFT #${nft.index}`}
        </h3>

        {/* Description */}
        {nft.metadata?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {nft.metadata.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Token ID:</span>
            <span className="font-medium text-muted-foreground">
              {nft.tokenId || `#${nft.index}`}
            </span>
          </div>
          
          {nft.isMinted && nft.owner && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Owner:</span>
              <a 
                href={`https://etherscan.io/address/${nft.owner}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {formatAddress(nft.owner)}
              </a>
            </div>
          )}

          {!nft.isMinted && mintingFee && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Mint Price:</span>
              <span className="font-medium text-muted-foreground">{mintingFee} ETH</span>
            </div>
          )}
        </div>

        {/* Attributes */}
        {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Traits:</p>
            <div className="flex flex-wrap gap-1">
              {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground"
                >
                  {attr.trait_type}: {attr.value}
                </span>
              ))}
              {nft.metadata.attributes.length > 3 && (
                <span className="px-2 py-1 text-xs bg-muted rounded-md text-muted-foreground">
                  +{nft.metadata.attributes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Button - Pushed to bottom */}
        <div className="mt-auto">
          {nft.isMinted ? (
            <button 
              className="w-full bg-muted text-muted-foreground px-4 py-2 rounded-lg cursor-not-allowed"
              disabled
            >
              {nft.owner ? formatAddress(nft.owner) : 'Minted'}
            </button>
          ) : (
            <button 
              onClick={handleMint}
              disabled={!isRegistered || isLoading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                !isRegistered 
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : isLoading
                  ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Minting...
                </div>
              ) : !isRegistered ? (
                'Register to Mint'
              ) : (
                `Mint for ${mintingFee} ETH`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}