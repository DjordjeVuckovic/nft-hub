import {Injectable, Logger, OnModuleInit, Inject} from '@nestjs/common';
import {PinataSDK} from 'pinata';
import type {AppConfig} from '../providers/config.provider';
import {IpfsUploadResult, NftMetadata, FileUploadMetadata} from "./nft-metadata.types";
import {PinataUploadBuilder} from './pinata.builder';

@Injectable()
export class IpfsService implements OnModuleInit {
    private readonly logger = new Logger(IpfsService.name);
    private pinata: PinataSDK;

    constructor(@Inject('CONFIG') private readonly config: AppConfig) {
    }

    async onModuleInit() {
        try {
            this.pinata = new PinataSDK({
                pinataJwt: this.config.ipfsConfig.pinataJwt,
                pinataGateway: this.config.ipfsConfig.gatewayUrl,
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
                .group(this.config.ipfsConfig.groupId)
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
                .group(this.config.ipfsConfig.groupId)
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
                .group(this.config.ipfsConfig.groupId)
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


    getGatewayUrl(hash: string): string {
        return `${this.config.ipfsConfig.gatewayUrl}/${hash}`;
    }
}
