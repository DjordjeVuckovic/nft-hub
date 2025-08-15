import {Inject, Injectable, Logger, Param} from '@nestjs/common';
import {CACHE_MANAGER} from "@nestjs/cache-manager";
import type {Cache} from 'cache-manager';
import {EthService} from '../eth/eth.service';
import {IpfsService} from '../ipfs/ipfs.service';
import {NFT, NFTCollectionResponse} from "./nfts.types";
import {ContractNFT} from "../eth/eth.types";

const CACHE_ALL_TTL = 30 * 60 * 1000;

@Injectable()
export class NftsService {
	private readonly logger = new Logger(NftsService.name);

	constructor(
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
		private ethService: EthService,
		private ipfsService: IpfsService
	) {
	}

	async getAll(useCache: boolean): Promise<NFTCollectionResponse> {
		const cacheKey = 'nft:all';
		if (useCache) {
			let cached = await this.cacheManager.get<NFTCollectionResponse>(cacheKey);
			if (cached) {
				return cached;
			}
		}

		try {
			const [collectionInfo, predefinedURIs, mintedNFTs] = await Promise.all([
				this.ethService.getCollectionInfo(),
				this.ethService.getPredefinedMetadataURIs(),
				this.ethService.getAllMintedNFTs()
			]);

			const nfts: NFT[] = [];

			for (let i = 0; i < predefinedURIs.length; i++) {
				const metadataURI = predefinedURIs[i];

				if (!metadataURI || metadataURI.trim() === '') {
					continue;
				}

				const mintedNFT = mintedNFTs.find((nft: ContractNFT) => {
					return nft.tokenURI === metadataURI;
				});

				let metadata = null;
				try {
					metadata = await this.ipfsService.fetchMetadata(metadataURI);
				} catch (error) {
					this.logger.error(`Failed to fetch metadata for URI ${metadataURI}: ${error.message}`);
				}

				nfts.push({
					index: i,
					tokenId: mintedNFT?.tokenId,
					owner: mintedNFT?.owner,
					tokenURI: metadataURI,
					metadata,
					isMinted: !!mintedNFT
				});
			}

			const result: NFTCollectionResponse = {
				nfts: nfts,
				collectionInfo
			};

			await this.cacheManager.set(cacheKey, result, CACHE_ALL_TTL);
			return result;
		} catch (error) {
			throw new Error(`Failed to get unified NFT collection: ${error.message}`);
		}
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
