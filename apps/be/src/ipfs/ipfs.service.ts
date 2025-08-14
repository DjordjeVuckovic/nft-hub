import {Injectable, Logger, OnModuleInit, Inject} from '@nestjs/common';
import {PinataSDK} from 'pinata';
import type {IpfsConfig} from '../config/config.types';
import {IpfsUploadResult, NftMetadata, FileUploadMetadata} from "./nft-metadata.types";
import {PinataUploadBuilder} from './pinata.builder';

const IPFS_PROTOCOL_PREFIX = 'ipfs://';

@Injectable()
export class IpfsService implements OnModuleInit {
	private readonly logger = new Logger(IpfsService.name);
	private pinata: PinataSDK;

	constructor(@Inject('IPFS_CONFIG') private readonly config: IpfsConfig) {
	}

	async onModuleInit() {
		try {
			this.pinata = new PinataSDK({
				pinataJwt: this.config.pinataJwt,
				pinataGateway: this.config.gatewayUrl,
			});

			this.logger.log('Pinata service initialized successfully');
		} catch (error) {
			this.logger.error('Failed to initialize Pinata service:', error);
			throw error;
		}
	}

	async uploadFile(fileBuffer: Buffer, filename?: string): Promise<IpfsUploadResult> {
		try {
			this.logger.log(`Uploading file to Pinata${filename ? ` (${filename})` : ''}`);

			const file = new File([new Uint8Array(fileBuffer)], filename || 'file', {
				type: 'application/octet-stream',
			});

			const upload = await new PinataUploadBuilder(this.pinata)
				.file(file)
				.group(this.config.groupId)
				.upload();

			const cid = upload.cid;

			this.logger.log(`File uploaded successfully to Pinata: ${cid}`);

			return {
				cid: cid,
				size: fileBuffer.length
			};
		} catch (error) {
			this.logger.error('Failed to upload file to Pinata:', error);
			throw new Error(`Pinata upload failed: ${error.message}`);
		}
	}

	async uploadJson<T extends NftMetadata>(jsonData: T, metadata?: FileUploadMetadata): Promise<IpfsUploadResult> {
		try {
			this.logger.log('Uploading JSON data to Pinata');

			const upload = await new PinataUploadBuilder(this.pinata)
				.json(jsonData)
				.metadata(metadata)
				.group(this.config.groupId)
				.upload();

			const cid = upload.cid;
			const jsonString = JSON.stringify(jsonData, null, 2);

			this.logger.log(`JSON uploaded successfully to Pinata: ${cid}`);

			return {
				cid: cid,
				size: Buffer.from(jsonString, 'utf-8').length
			};
		} catch (error) {
			this.logger.error('Failed to upload JSON to Pinata:', error);
			throw new Error(`Pinata JSON upload failed: ${error.message}`);
		}
	}


	async uploadFileWithMetadata(
		fileBuffer: Buffer,
		filename?: string,
		metadata?: FileUploadMetadata
	): Promise<IpfsUploadResult> {
		try {
			this.logger.log(`Uploading file to Pinata${filename ? ` (${filename})` : ''}`);

			const file = new File([new Uint8Array(fileBuffer)], filename || 'file', {
				type: 'application/octet-stream',
			});

			const upload = await new PinataUploadBuilder(this.pinata)
				.file(file)
				.metadata(metadata)
				.group(this.config.groupId)
				.upload();

			const cid = upload.cid;
			this.logger.debug(`File uploaded successfully to Pinata: ${cid}`);

			return {
				cid: cid,
				size: fileBuffer.length
			};
		} catch (error) {
			this.logger.error('Failed to upload file to Pinata:', error);
			throw new Error(`Pinata upload failed: ${error.message}`);
		}
	}

	async fetchMetadata(uri: string): Promise<any> {
		if (!uri.startsWith(IPFS_PROTOCOL_PREFIX)) {
			throw new Error('Invalid IPFS URI format');
		}

		try {
			const ipfsHash = uri.replace(IPFS_PROTOCOL_PREFIX, '');
			const { data, contentType } = await this.pinata.gateways.public.get(ipfsHash);

			this.logger.debug(`Successfully fetched metadata for hash: ${ipfsHash}, contentType: ${contentType}`);
			return data;
		} catch (error) {
			this.logger.error(`Failed to fetch metadata for URI ${uri}:`, error);
			throw new Error(`Failed to fetch metadata from IPFS: ${error.message}`);
		}

	}

	async fetchImage(cidOrUri: string): Promise<{blob: Blob, contentType: string}> {
		try {
			let ipfsHash: string;

			if (cidOrUri.startsWith(IPFS_PROTOCOL_PREFIX)) {
				ipfsHash = cidOrUri.replace(IPFS_PROTOCOL_PREFIX, '');
			} else {
				ipfsHash = cidOrUri;
			}

			this.logger.debug(`Fetching image for CID: ${ipfsHash}`);
			const { data, contentType } = await this.pinata.gateways.public.get(ipfsHash);

			if (!contentType || !contentType.startsWith('image/')) {
				throw new Error(`Content is not an image. ContentType: ${contentType}`);
			}

			if(!data || !(data instanceof Blob)) {
				throw new Error(`Invalid image data received for CID: ${ipfsHash}`);
			}

			this.logger.debug(`Successfully fetched image: ${ipfsHash}, size: ${data.size}, contentType: ${contentType}`);
			return { blob: data, contentType };
		} catch (error) {
			this.logger.error(`Failed to fetch image for CID ${cidOrUri}:`, error);
			throw new Error(`Failed to fetch image from IPFS: ${error.message}`);
		}
	}
}
