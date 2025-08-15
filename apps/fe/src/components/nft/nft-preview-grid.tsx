import { NFTGrid } from './nft-grid'
import {useQueryNfts} from "@/hooks/useQueryNfts.ts";

interface NFTPreviewGridProps {
  limit?: number
}

export function NFTPreviewGrid({ limit = 4 }: NFTPreviewGridProps) {
    const {nftData, error, loading, refresh} = useQueryNfts()

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