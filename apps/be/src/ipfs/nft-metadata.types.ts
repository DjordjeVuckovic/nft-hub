export type IpfsUploadResult = {
    cid: string;
    size: number;
}

export type FileUploadMetadata = {
    name?: string;
    category?: string;
    creator?: string;
    project?: string;
    tags?: string[];
    customAttributes?: Record<string, string | number>;
}

export interface NftMetadata {
    name: string;
    description: string;
    image: string; // IPFS URL to the image
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
    external_url?: string;
    animation_url?: string;
    background_color?: string;
}

export interface NftUploadResult {
    imageCid: string;
    metadataCid: string;
    imageUrl: string;
    metadataUrl: string;
    metadata: NftMetadata;
}

export interface NftUploadRequest {
    name: string;
    description: string;
    image: string; // IPFS CID or full URL
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
    external_url?: string;
    background_color?: string;
}