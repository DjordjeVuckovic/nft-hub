import {NFTGrid} from './nft-grid'
import {useEthContract} from '@/hooks/useEthContract.ts'
import {useWallet} from "@/hooks/useWallet.ts";
import {NftGalleryHeader} from "@/components/nft/nft-gallery-header.tsx";
import {useQueryNfts} from "@/hooks/useQueryNfts.ts";

export function NFTGallery() {
    const {nftData, error, loading, refresh} = useQueryNfts()

    const {isRegistered} = useEthContract()
    const {isConnected} = useWallet()

    const availableCount = nftData?.nfts.filter(nft => !nft.isMinted).length || 0
    const mintedCount = nftData?.nfts.filter(nft => nft.isMinted).length || 0

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">

                    <NftGalleryHeader
                        total={nftData?.nfts.length || 0}
                        availableCount={availableCount}
                        mintedCount={mintedCount}
                        mintingFee={nftData?.collectionInfo?.mintingFee}
                        loading={loading}
                    />

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
                    <NFTGrid 
                        nfts={nftData?.nfts || []}
                        loading={loading}
                        error={error}
                        showRefresh={true}
                        onRefresh={refresh}
                        onMintSuccess={refresh}
                    />
                </div>
            </div>
        </div>
    )
}

