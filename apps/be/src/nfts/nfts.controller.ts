import { Controller, Get, Param, Query, Delete } from '@nestjs/common';
import { NftsService } from './nfts.service';
import {CollectionInfo} from "./nfts.types";

@Controller('/api/v1/nfts')
export class NftsController {
	constructor(private readonly nftsService: NftsService) {}

	@Get('collection/info')
	async getCollectionInfo(): Promise<CollectionInfo> {
		return this.nftsService.getCollectionInfo();
	}

	@Get('collection')
	async getAllNFTs() {
		return this.nftsService.getAllNFTs();
	}

	@Get('owner/:address')
	async getNFTsByOwner(@Param('address') address: string) {
		return this.nftsService.getNFTsByOwner(address);
	}

	@Get(':tokenId')
	async getNFTById(@Param('tokenId') tokenId: string) {
		const nft = await this.nftsService.getNFTById(tokenId);
		if (!nft) {
			return { error: 'NFT not found', tokenId };
		}
		return nft;
	}

	@Get(':tokenId/metadata')
	async getNFTMetadata(@Param('tokenId') tokenId: string) {
		return this.nftsService.getNFTMetadata(tokenId);
	}

	@Delete('cache')
	async clearCache(@Query('pattern') pattern?: string) {
		if (pattern) {
			await this.nftsService.clearCacheByPattern(pattern);
			return { message: `Cache cleared for pattern: ${pattern}` };
		}

		await this.nftsService.clearCache();
		return { message: 'All cache cleared' };
	}
}
