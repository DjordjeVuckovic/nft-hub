import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFile,
	Body,
	BadRequestException,
	HttpStatus,
	HttpCode,
	UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IpfsService } from './ipfs.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import type { IpfsUploadResult, NftMetadata, FileUploadMetadata } from './nft-metadata.types';

type UploadResponse = {
	data: IpfsUploadResult;
};

@Controller('api/v1/ipfs')
@UseGuards(ApiKeyGuard)
export class IpfsController {
	constructor(private readonly ipfsService: IpfsService) {}

	@Post('upload')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<UploadResponse> {
		this.validateFile(file);

		try {
			const result = await this.ipfsService.uploadFile(file.buffer, file.originalname);

			return {
				data: result,
			};
		} catch (error) {
			throw new BadRequestException(`Upload failed: ${error.message}`);
		}
	}

	@Post('metadata')
	@HttpCode(HttpStatus.OK)
	async createNftMetadata(@Body() metadataRequest: NftMetadata): Promise<UploadResponse> {
		if (!metadataRequest.name || !metadataRequest.description) {
			throw new BadRequestException('Name and description are required for NFT metadata');
		}

		if (!metadataRequest.image) {
			throw new BadRequestException('Image URL/CID is required for NFT metadata');
		}

		try {
			const uploadMetadata: FileUploadMetadata = {
				name: `${metadataRequest.name} - NFT Metadata`,
				category: 'nft-metadata',
				project: metadataRequest.name,
			};

			const result = await this.ipfsService.uploadJson(metadataRequest, uploadMetadata);

			return {
				data: result,
			};
		} catch (error) {
			throw new BadRequestException(`Metadata upload failed: ${error.message}`);
		}
	}

	@Post('upload/with-metadata')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(FileInterceptor('file'))
	async uploadFileWithMetadata(
		@UploadedFile() file: Express.Multer.File,
		@Body()
		metadata: {
			name?: string;
			category?: string;
			creator?: string;
			project?: string;
			tags?: string;
			customAttributes?: string;
		},
	): Promise<UploadResponse> {
		this.validateFile(file);

		try {
			const parseMetadata = this.createMetadata(metadata, file.originalname);

			const result = await this.ipfsService.uploadFileWithMetadata(file.buffer, file.originalname, parseMetadata);

			return {
				data: result,
			};
		} catch (error) {
			throw new BadRequestException(`Upload with metadata failed: ${error.message}`);
		}
	}

	private validateFile(file: Express.Multer.File): void {
		if (!file) {
			throw new BadRequestException('No file provided');
		}

		const allowedMimeTypes = [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			'application/json',
			'text/plain',
			'application/pdf',
		];

		if (!allowedMimeTypes.includes(file.mimetype)) {
			throw new BadRequestException(`File type ${file.mimetype} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`);
		}

		const maxSize = 10 * 1024 * 1024;
		if (file.size > maxSize) {
			throw new BadRequestException(`File size too large. Maximum allowed size: ${maxSize / (1024 * 1024)}MB`);
		}
	}

	private createMetadata(
		metadataDto: {
			name?: string;
			category?: string;
			creator?: string;
			project?: string;
			tags?: string;
			customAttributes?: string;
		},
		fallbackName?: string,
	): FileUploadMetadata {
		return {
			name: metadataDto.name || fallbackName,
			category: metadataDto.category,
			creator: metadataDto.creator,
			project: metadataDto.project,
			tags: metadataDto.tags ? metadataDto.tags.split(',').map((tag) => tag.trim()) : undefined,
			customAttributes: metadataDto.customAttributes ? JSON.parse(metadataDto.customAttributes) : undefined,
		};
	}
}
