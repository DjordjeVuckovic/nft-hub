import {Inject, Injectable} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import type { Cache } from 'cache-manager';
import { EthService } from '../eth/eth.service';
import {CollectionInfo, CollectionResponse, NFT} from "./nfts.types";

@Injectable()
export class NftsService {
	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private ethService: EthService
	) {}

	async getCollectionInfo(): Promise<CollectionInfo> {
		const cacheKey = 'nft:collection:info';

		let collectionInfo = await this.cacheManager.get<CollectionInfo>(cacheKey);
		if (collectionInfo) {
			return collectionInfo;
		}

		collectionInfo = await this.ethService.getCollectionInfo();

		await this.cacheManager.set(cacheKey, collectionInfo, 300000);

		return collectionInfo;
	}

	async getAllNFTs(): Promise<CollectionResponse> {
		const cacheKey = 'nft:collection:all';

		let collection = await this.cacheManager.get<CollectionResponse>(cacheKey);
		if (collection) {
			return collection;
		}

		collection = await this.ethService.getAllNFTs();

		await this.cacheManager.set(cacheKey, collection, 120000);

		return collection;
	}

	async getNFTsByOwner(ownerAddress: string): Promise<NFT[]> {
		const cacheKey = `nft:owner:${ownerAddress.toLowerCase()}`;

		let nfts = await this.cacheManager.get<NFT[]>(cacheKey);
		if (nfts) {
			return nfts;
		}

		nfts = await this.ethService.getNFTsByOwner(ownerAddress);

		await this.cacheManager.set(cacheKey, nfts, 60000);

		return nfts;
	}

	async getNFTById(tokenId: string): Promise<NFT | null> {
		const cacheKey = `nft:token:${tokenId}`;

		let nft = await this.cacheManager.get<NFT | null>(cacheKey);
		if (nft !== undefined) {
			return nft;
		}

		nft = await this.ethService.getNFTById(tokenId);

		await this.cacheManager.set(cacheKey, nft, 300000);

		return nft;
	}

	async getNFTMetadata(tokenId: string): Promise<any> {
		const cacheKey = `nft:metadata:${tokenId}`;

		let metadata = await this.cacheManager.get<any>(cacheKey);
		if (metadata) {
			return metadata;
		}

		metadata = await this.ethService.getNFTMetadata(tokenId);

		await this.cacheManager.set(cacheKey, metadata, 600000);

		return metadata;
	}

	async clearCache(): Promise<void> {
		await this.cacheManager.clear();
	}

	async clearCacheByPattern(pattern: string): Promise<void> {
		const keys = ['nft:collection:info', 'nft:collection:all'];

		if (pattern === 'collection') {
			for (const key of keys) {
				await this.cacheManager.del(key);
			}
		}
	}
}
