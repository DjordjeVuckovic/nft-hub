import {useState, useEffect} from 'react'
import {NFTCard} from './nft-card'
import {getNfts} from '@/api/nfts-api'
import {useEthContract} from '@/hooks/useEthContract.ts'
import {Button} from "@/components/ui/button.tsx";
import type {NFTCollectionResponse} from '@/types/nft'

export function NFTGallery() {
    const [nftData, setNftData] = useState<NFTCollectionResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isConnected = true // Replace with actual connection check logic
    const {isRegistered} = useEthContract()

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

    const availableCount = nftData?.nfts.filter(nft => !nft.isMinted).length || 0
    const mintedCount = nftData?.nfts.filter(nft => nft.isMinted).length || 0

    if (loading) {
        return <LoadingFallback />
    }

    if (error) {
        return (
            <ErrorFallback
                error={new Error(error)}
                resetErrorBoundary={fetchNFTs}
            />
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2 text-foreground">NFT Collection</h1>
                        <p className="text-muted-foreground mb-4">
                            Discover and mint unique NFTs from our collection
                        </p>

                        {/* Collection Stats */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="bg-card border border-border rounded-lg px-4 py-2">
                                <span className="text-muted-foreground">Total: </span>
                                <span className="font-medium text-muted-foreground">{nftData?.nfts.length || 0}</span>
                            </div>
                            <div className="bg-card border border-border rounded-lg px-4 py-2">
                                <span className="text-muted-foreground">Available: </span>
                                <span className="font-medium text-blue-500">{availableCount}</span>
                            </div>
                            <div className="bg-card border border-border rounded-lg px-4 py-2">
                                <span className="text-muted-foreground">Minted: </span>
                                <span className="font-medium text-green-600">{mintedCount}</span>
                            </div>
                            {nftData?.collectionInfo && (
                                <div className="bg-card border border-border rounded-lg px-4 py-2">
                                    <span className="text-muted-foreground">Mint Fee: </span>
                                    <span className="font-medium text-muted-foreground">
                                        {nftData.collectionInfo.mintingFee} ETH
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Connection Status */}
                    {!isConnected && (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
                            <p className="text-warning">
                                🔗 Connect your wallet to mint NFTs
                            </p>
                        </div>
                    )}

                    {isConnected && !isRegistered && (
                        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6 border-primary">
                            <p className="text-info text-muted-foreground">
                                📝 You need to connect wallet and register before minting NFTs
                            </p>
                        </div>
                    )}

                    {/* NFT Grid */}
                    {nftData?.nfts && nftData.nfts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {nftData.nfts.map((nft) => (
                                <NFTCard
                                    key={nft.index}
                                    nft={nft}
                                    onMintSuccess={handleMintSuccess}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-2xl">🎨</span>
                            </div>
                            <p className="text-muted-foreground text-lg mb-2">No NFTs found</p>
                            <p className="text-muted-foreground">
                                No NFTs available in the collection
                            </p>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Button
                            onClick={fetchNFTs}
                            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            🔄 Refresh Collection
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div
                                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
                            <p className="text-muted-foreground">Loading NFTs...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                        <p className="text-destructive font-medium mb-2">Failed to load NFTs</p>
                        <p className="text-muted-foreground mb-4">{error.message}</p>
                        <Button
                            onClick={resetErrorBoundary}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}