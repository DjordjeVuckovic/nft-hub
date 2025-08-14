type NftGalleryHeaderProps = {
    total: number
    availableCount: number
    mintedCount: number
    mintingFee?: string
    loading: boolean
}

export function NftGalleryHeader({
                                     total,
                                     availableCount,
                                     mintedCount,
                                     mintingFee,
                                     loading,

                                 }: NftGalleryHeaderProps) {
    if (loading) {
        return (
            <div className="pb-8">
                <h1 className="text-3xl font-bold mb-2 text-foreground">NFT Collection</h1>
                <p className="text-muted-foreground mb-4">Loading...</p>
            </div>
        )
    }

    return (
        <div className="pb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">NFT Collection</h1>
            <p className="text-muted-foreground mb-4">
                Discover and mint unique NFTs from our collection
            </p>

            {/* Collection Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-medium text-muted-foreground">{total}</span>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <span className="text-muted-foreground">Available: </span>
                    <span className="font-medium text-blue-500">{availableCount}</span>
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                    <span className="text-muted-foreground">Minted: </span>
                    <span className="font-medium text-green-600">{mintedCount}</span>
                </div>
                {mintingFee && (
                    <div className="bg-card border border-border rounded-lg px-4 py-2">
                        <span className="text-muted-foreground">Mint Fee: </span>
                        <span className="font-medium text-muted-foreground">
                                        {mintedCount} ETH
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}