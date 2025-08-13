type NFTMetadata = {
	id: number | string;
	name: string;
	description: string;
	image: string;
	attributes?: Array<{ trait_type: string; value: string | number }>;
	external_url?: string;
	background_color?: string;
	[key: string]: any;

}

type NFT = {
	index: number;
	tokenId?: string;  // Only present if minted
	owner?: string;    // Only present if minted
	tokenURI: string;
	metadata?: NFTMetadata | null;
	isMinted: boolean;
}

type CollectionInfo = {
	contractAddress: string;
	name: string;
	symbol: string;
	totalSupply: string;
	nextTokenId: string;
	registrationFee: string;
	mintingFee: string;
}

type NFTCollectionResponse = {
	nfts: NFT[];
	collectionInfo: CollectionInfo;
}

export type {
	NFTMetadata,
	NFT,
	CollectionInfo,
	NFTCollectionResponse
}