type NFT = {
	tokenId: string;
	owner: string;
	tokenURI: string;
	metadata?: any;
}

type CollectionInfo = {
	contractAddress: string;
	name: string;
	symbol: string;
	totalSupply: string;
}

type CollectionResponse = {
	nfts: NFT[];
	totalSupply: string;
	nextTokenId: string;
}

export type {
	NFT,
	CollectionInfo,
	CollectionResponse
}