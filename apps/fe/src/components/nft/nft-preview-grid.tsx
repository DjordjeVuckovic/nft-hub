import { useState, useEffect } from 'react'
import { NFTGrid } from './nft-grid'
import { getNfts } from '@/api/nfts-api'
import type { NFTCollectionResponse } from '@/types/nft'

interface NFTPreviewGridProps {
  limit?: number
}

export function NFTPreviewGrid({ limit = 4 }: NFTPreviewGridProps) {
  const [nftData, setNftData] = useState<NFTCollectionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNFTs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getNfts()
      setNftData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNFTs()
  }, [])

  const handleMintSuccess = () => {
    fetchNFTs()
  }

  return (
    <NFTGrid 
      nfts={nftData?.nfts || []}
      loading={loading}
      error={error}
      limit={limit}
      onMintSuccess={handleMintSuccess}
    />
  )
}