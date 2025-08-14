import type {NFTCollectionResponse} from "@/types/nft.ts";
import {environment} from "@/config/env.ts";

const BACKEND_URL = environment.BACKEND_URL;

export const getNfts = async (): Promise<NFTCollectionResponse> => {
	const response = await fetch(`${BACKEND_URL}/api/v1/nfts`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch NFTs: ${response.statusText}`);
	}

	return response.json();
}

export const getNftImage = (cidOrUri: string): string => {
	let cid: string;
	
	if (cidOrUri.startsWith('ipfs://')) {
		cid = cidOrUri.replace('ipfs://', '');
	} else {
		cid = cidOrUri;
	}
	
	return `${BACKEND_URL}/api/v1/nfts/image/${cid}`;
}