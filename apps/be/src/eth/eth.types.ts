export type ContractNFT = {
	tokenId: string;
	owner: string;
	tokenURI: string;
};

export interface BasicCollectionInfo {
	contractAddress: string;
	name: string;
	symbol: string;
	totalSupply: string;
	nextTokenId: string;
	registrationFee: string;
	mintingFee: string;
}
