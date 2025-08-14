import { NFTGrid } from './nft-grid'
import {useQueryNFTs} from "@/hooks/useQueryNFTs.ts";

interface NFTPreviewGridProps {
  limit?: number
}

export function NFTPreviewGrid({ limit = 4 }: NFTPreviewGridProps) {
    const {nftData, error, loading, refresh} = useQueryNFTs()

  return (
    <NFTGrid 
      nfts={nftData?.nfts || []}
      loading={loading}
      error={error}
      limit={limit}
      onMintSuccess={refresh}
    />
  )
}