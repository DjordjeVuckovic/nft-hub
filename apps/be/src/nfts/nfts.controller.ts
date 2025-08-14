import {Controller, Get, Delete, Query, UseGuards, Param, Res, HttpStatus, HttpException} from '@nestjs/common';
import {type Response} from 'express';
import {NftsService} from './nfts.service';
import {NFTCollectionResponse} from "./nfts.types";
import {ApiKeyGuard} from "../auth/api-key.guard";
import {IpfsService} from '../ipfs/ipfs.service';

@Controller('/api/v1/nfts')
export class NftsController {
	constructor(
		private readonly nftsService: NftsService,
		private readonly ipfsService: IpfsService
	) {
	}

	@Get()
	async getAllNFTsUnified(): Promise<NFTCollectionResponse> {
		return this.nftsService.getAll();
	}

	@Get('image/:cid')
	async getImage(@Param('cid') cid: string, @Res() res: Response) {
		try {
			const {blob, contentType} = await this.ipfsService.fetchImage(cid);

			const arrayBuffer = await blob.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			res.set({
				'Content-Type': contentType,
				'Content-Length': buffer.length.toString(),
				...this.buildCacheControlHeader(cid)
			});

			res.send(buffer);
		} catch (error) {
			throw new HttpException(
				`Failed to fetch image: ${error.message}`,
				HttpStatus.NOT_FOUND
			);
		}
	}

	@Delete('cache')
	@UseGuards(ApiKeyGuard)
	async clearCache(@Query('pattern') pattern?: string) {
		if (pattern) {
			await this.nftsService.clearCacheByPattern(pattern);
			return {message: `Cache cleared for pattern: ${pattern}`};
		}

		await this.nftsService.clearCache();
		return {message: 'All cache cleared'};
	}

	private buildCacheControlHeader(key: string, expSeconds: number = 31536000) {
		return {
			'Cache-Control': `public, max-age=${expSeconds}, immutable`,
			'ETag': `"${key}"`,
		};
	}
}