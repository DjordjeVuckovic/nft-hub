import { NFTCard } from './nft-card'
import { Button } from '@/components/ui/button'
import type { NFT } from '@/types/nft'

interface NFTGridProps {
  nfts: NFT[]
  loading?: boolean
  error?: string | null
  limit?: number
  showRefresh?: boolean
  onRefresh?: () => void
  onMintSuccess?: () => void
}

export function NFTGrid({ 
  nfts, 
  loading = false, 
  error = null, 
  limit, 
  showRefresh = false, 
  onRefresh,
  onMintSuccess 
}: NFTGridProps) {

  if (loading) {
    return (
        <LoadingSkeleton
            count={limit || 8}
        />
    )
  }

  if (error) {
    return (
        <ErrorFallback
            error={error}
            onRefresh={onRefresh}
        />
    )
  }

  const nftsToShow = limit ? nfts.slice(0, limit) : nfts

  if (nftsToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">🎨</span>
        </div>
        <p className="text-muted-foreground text-lg mb-2">No NFTs found</p>
        <p className="text-muted-foreground">
          No NFTs available in the collection
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nftsToShow.map((nft) => (
          <NFTCard
            key={nft.index}
            nft={nft}
            onMintSuccess={onMintSuccess}
          />
        ))}
      </div>
      
      {showRefresh && onRefresh && (
        <div className="mt-8 text-center">
          <Button
            onClick={onRefresh}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            🔄 Refresh Collection
          </Button>
        </div>
      )}
    </>
  )
}


const LoadingSkeleton = ({ count = 8 }: { count?: number }) => (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="bg-muted rounded-lg p-4 border border-border animate-pulse">
                    <div className="aspect-square bg-background rounded-lg mb-3 border border-border" />
                    <div className="h-4 bg-background rounded mb-2" />
                    <div className="h-3 bg-background rounded w-2/3" />
                </div>
            ))}
        </div>
        {!count && (
            <div className="mt-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading NFTs...</p>
            </div>
        )}
    </>
)

const ErrorFallback = ({ error, onRefresh }: { error: string, onRefresh?: () => void }) => (
   <>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center col-span-full">
               <p className="text-destructive font-medium mb-2">Failed to load NFTs</p>
               <p className="text-muted-foreground mb-4">{error}</p>
               {onRefresh && (
                   <Button
                       onClick={onRefresh}
                       className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                   >
                       Try Again
                   </Button>
               )}
           </div>
       </div>
   </>
)