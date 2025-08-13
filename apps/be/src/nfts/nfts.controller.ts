import {Controller, Get, Delete, Query, UseGuards} from '@nestjs/common';
import { NftsService } from './nfts.service';
import { NFTCollectionResponse } from "./nfts.types";
import {ApiKeyGuard} from "../auth/api-key.guard";

@Controller('/api/v1/nfts')
export class NftsController {
	constructor(private readonly nftsService: NftsService) {}

	@Get()
	async getAllNFTsUnified(): Promise<NFTCollectionResponse> {
		return this.nftsService.getAllNFTsUnified();
	}

	@Delete('cache')
	@UseGuards(ApiKeyGuard)
	async clearCache(@Query('pattern') pattern?: string) {
		if (pattern) {
			await this.nftsService.clearCacheByPattern(pattern);
			return { message: `Cache cleared for pattern: ${pattern}` };
		}

		await this.nftsService.clearCache();
		return { message: 'All cache cleared' };
	}
}