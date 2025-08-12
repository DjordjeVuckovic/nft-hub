import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import { resolve } from 'path';
import {NftMetadata, UploadResponse, SeederConfig, IPFSNFTMetadata, SeededNft, SeederOutput} from './types';
import { retry, sleep } from './utils';
import { loadFile, saveJsonFile } from './file-manager';
import nftsMapping from '../assets/nfts-mapping.json';

const OUTPUT_LOCATION = 'assets/seeder-output.json';


export class NftSeeder {
  private axios: AxiosInstance;
  private config: SeederConfig;

  constructor(config: SeederConfig) {
    this.config = config;
    this.axios = axios.create({
      baseURL: config.backendUrl,
      timeout: 30000,
      headers: {
        'X-API-Key': config.apiKey,
      },
    });
  }

  private async uploadImageToIPFS(imagePath: string, filename: string): Promise<string> {
		console.log(`Uploading image: ${filename}`);

		const imageBuffer = await loadFile(imagePath);
		const formData = new FormData();
		formData.append('file', imageBuffer, filename);

		const response = await this.axios.post<UploadResponse>('/api/v1/ipfs/upload', formData, {
			headers: {
				...formData.getHeaders(),
				'Content-Type': 'multipart/form-data',
			},
		});

		const imageCid = response.data.data.cid;
		console.log(`Image uploaded successfully: ${imageCid}`);
		return imageCid;
  }

  private async uploadMetadataToIPFS(metadata: IPFSNFTMetadata): Promise<string> {
		console.log(`Uploading metadata for: ${metadata.name} ...`);

		const response = await this.axios.post<UploadResponse>('/api/v1/ipfs/metadata', metadata);

		const metadataCid = response.data.data.cid;
		console.log(`Metadata uploaded successfully: ${metadataCid}`);
		return metadataCid;
  }


  private getImagePath(nft: NftMetadata): string {
    const cleanPath = nft.image.replace('../', '');
    return resolve(process.cwd(), cleanPath);
  }

  public async seedNft(nft: NftMetadata): Promise<{ imageCid: string; metadataCid: string }> {
    console.log(`\n Seeding NFT: ${nft.name} (ID: ${nft.id})`);

    const imagePath = this.getImagePath(nft);
    const filename = nft.image.split('/').pop() || `nft-${nft.id}.png`;

    const imageCid = await retry(
      () => this.uploadImageToIPFS(imagePath, filename),
      `image upload for ${nft.name}`,
      this.config.maxRetries,
      this.config.retryDelay
    );

    const metadataForUpload = {
      name: nft.name,
      description: nft.description,
      image: `ipfs://${imageCid}`,
      attributes: nft.attributes,
      external_url: nft.external_url,
      background_color: nft.background_color,
    };

    const metadataCid = await retry(
      () => this.uploadMetadataToIPFS(metadataForUpload),
      `metadata upload for ${nft.name}`,
      this.config.maxRetries,
      this.config.retryDelay
    );

    console.log(`🎉  Successfully seeded ${nft.name}!`);
    console.log(`Image CID: ${imageCid}`);
    console.log(`Metadata CID: ${metadataCid}`);

    return { imageCid, metadataCid };
  }

  public async seedAllNfts(): Promise<void> {
    console.log('🚀  Starting NFT seeding process...');

    const results: Array<{ nft: NftMetadata; imageCid: string; metadataCid: string; }> = [];
    const errors: Array<{ nft: NftMetadata; error: Error; }> = [];

    for (const nft of nftsMapping) {
      try {
        const { imageCid, metadataCid } = await this.seedNft(nft);
        results.push({ nft, imageCid, metadataCid });

        await sleep(1000);
      } catch (error) {
        console.error(`Failed to seed ${nft.name}:`, error);
        errors.push({ nft, error: error as Error });
      }
    }

    console.log('\n SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Successfully seeded: ${results.length} NFTs`);
    console.log(`Failed to seed: ${errors.length} NFTs`);

    if (results.length > 0) {
      console.log('\n SUCCESSFUL UPLOADS:');
      results.forEach(({ nft, imageCid, metadataCid }) => {
        console.log(`🐳  ${nft.name} (ID: ${nft.id})`);
        console.log(`  Image: ipfs://${imageCid}`);
        console.log(`   Metadata: ipfs://${metadataCid}`);
      });
    }

    if (errors.length > 0) {
      console.log('\n FAILED UPLOADS:');
      errors.forEach(({ nft, error }) => {
        console.log(`  ${nft.name} (ID: ${nft.id}): ${error.message}`);
      });
    }

    const output = this.generateJsonOutput(results, errors);
    await saveJsonFile(output, OUTPUT_LOCATION);

    console.log('\n🏁 Seeding process completed!');
  }

  private generateJsonOutput(
    results: Array<{ nft: NftMetadata; imageCid: string; metadataCid: string; }>,
    errors: Array<{ nft: NftMetadata; error: Error; }>
  ): SeederOutput {
    const seededNfts: SeededNft[] = results.map(({ nft, imageCid, metadataCid }) => ({
      id: nft.id,
      name: nft.name,
      imageCid,
      metadataCid,
      metadataUri: `ipfs://${metadataCid}`
    }));

    const errorEntries = errors.map(({ nft, error }) => ({
      id: nft.id,
      name: nft.name,
      error: error.message
    }));

    return {
      timestamp: new Date().toISOString(),
      totalSeeded: results.length,
      totalFailed: errors.length,
      nfts: seededNfts,
      errors: errorEntries
    };
  }

}