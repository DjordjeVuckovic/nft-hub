import { PinataSDK } from 'pinata';
import { FileUploadMetadata } from './nft-metadata.types';

export class PinataUploadBuilder {
    private uploadChain: any;
    private sdk: PinataSDK;

    constructor(sdk: PinataSDK) {
        this.sdk = sdk;
    }

    file(file: File) {
        this.uploadChain = this.sdk.upload.public.file(file);
        return this;
    }

    json(data: any) {
        this.uploadChain = this.sdk.upload.public.json(data);
        return this;
    }

    name(name: string) {
        if (this.uploadChain && name) {
            this.uploadChain = this.uploadChain.name(name);
        }
        return this;
    }

    keyvalues(keyvalues: Record<string, string>) {
        if (this.uploadChain && keyvalues && Object.keys(keyvalues).length > 0) {
            this.uploadChain = this.uploadChain.keyvalues(keyvalues);
        }
        return this;
    }

    group(groupId: string) {
        if (this.uploadChain && groupId) {
            this.uploadChain = this.uploadChain.group(groupId);
        }
        return this;
    }

    metadata(metadata?: FileUploadMetadata) {
        if (!metadata) return this;

        if (metadata.name) {
            this.name(metadata.name);
        }

        const keyvalues: Record<string, string> = {};
        
        if (metadata.category) keyvalues.category = metadata.category;
        if (metadata.creator) keyvalues.creator = metadata.creator;
        if (metadata.project) keyvalues.project = metadata.project;
        if (metadata.tags?.length) keyvalues.tags = metadata.tags.join(',');
        
        if (metadata.customAttributes) {
            Object.entries(metadata.customAttributes).forEach(([key, value]) => {
                keyvalues[`custom_${key}`] = String(value);
            });
        }

        this.keyvalues(keyvalues);
        return this;
    }

    async upload() {
        if (!this.uploadChain) {
            throw new Error('No upload chain configured. Call file() or json() first.');
        }
        return await this.uploadChain;
    }
}