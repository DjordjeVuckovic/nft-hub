export type NftMetadata = {
  id: number;
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  background_color?: string;
}

export type IPFSNFTMetadata = Omit<NftMetadata, 'id' | 'image'> & { image: string }

export type UploadResponse = {
  data: {
    cid: string;
    size: number;
  };
}

export type SeederConfig = {
  backendUrl: string;
  apiKey: string;
  maxRetries: number;
  retryDelay: number;
}

export type SeededNft = {
  id: number;
  name: string;
  imageCid: string;
  metadataCid: string;
  metadataUri: string;
}

export type SeederOutput = {
  timestamp: string;
  totalSeeded: number;
  totalFailed: number;
  nfts: SeededNft[];
  errors: Array<{
    id: number;
    name: string;
    error: string;
  }>;
}