import {Injectable, Inject, OnModuleInit, Logger} from '@nestjs/common';
import { ethers } from 'ethers';
import { CONFIG_PROVIDER } from '../config/config.provider';
import type { AppConfig } from '../config/config.types';
import nftAbi from './abi/nft-hub.abi.json';

interface NFT {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadata?: any;
}

interface AvailableNFT {
  tokenId: string;
  metadataURI: string;
  metadata?: any;
}

interface CollectionInfo {
  contractAddress: string;
  name: string;
  symbol: string;
  totalSupply: string;
}

@Injectable()
export class EthService implements OnModuleInit {
	private readonly provider: ethers.JsonRpcProvider;
	private contract: ethers.Contract;
	private readonly logger = new Logger(EthService.name);

	constructor(@Inject(CONFIG_PROVIDER) private config: AppConfig) {
		this.provider = new ethers.JsonRpcProvider(this.config.ethConfig.rpcUrl);
	}

	async onModuleInit() {
		this.initContract();
	}

	private initContract() {
		try {

			const abi = Array.isArray(nftAbi) ? nftAbi : (nftAbi as any).default || nftAbi;

			this.contract = new ethers.Contract(
				this.config.ethConfig.contractAddress,
				abi,
				this.provider
			);
			this.logger.log('Contract initialized successfully');
		} catch (error) {
			this.logger.error('Failed to initialize contract:', error);
			throw new Error(`Failed to initialize contract: ${error.message}`);
		}
	}

	async getCollectionInfo(): Promise<CollectionInfo> {
		try {
			const [name, symbol, totalSupply] = await Promise.all([
				this.contract.name(),
				this.contract.symbol(),
				this.contract.getTotalSupply()
			]);

			return {
				contractAddress: this.config.ethConfig.contractAddress,
				name,
				symbol,
				totalSupply: totalSupply.toString()
			};
		} catch (error) {
			throw new Error(`Failed to get collection info: ${error.message}`);
		}
	}

	async getAllNFTs(): Promise<{ nfts: NFT[]; totalSupply: string; nextTokenId: string }> {
		try {
			const totalSupply = await this.contract.getTotalSupply();
			const nextTokenId = await this.contract.nextTokenId();
			const nfts: NFT[] = [];

			for (let tokenId = 0; tokenId < Number(nextTokenId); tokenId++) {
				try {
					const [owner, tokenURI] = await Promise.all([
						this.contract.ownerOf(tokenId),
						this.contract.tokenURI(tokenId)
					]);

					nfts.push({
						tokenId: tokenId.toString(),
						owner,
						tokenURI
					});
				} catch (tokenError) {
					console.log(`Token ${tokenId} does not exist or error occurred:`, tokenError.message);
				}
			}

			return {
				nfts,
				totalSupply: totalSupply.toString(),
				nextTokenId: nextTokenId.toString()
			};
		} catch (error) {
			throw new Error(`Failed to get all NFTs: ${error.message}`);
		}
	}

	async getNFTsByOwner(ownerAddress: string): Promise<NFT[]> {
		try {
			const balance = await this.contract.balanceOf(ownerAddress);
			if (Number(balance) === 0) {
				return [];
			}

			const allNFTs = await this.getAllNFTs();
			return allNFTs.nfts.filter(nft => nft.owner.toLowerCase() === ownerAddress.toLowerCase());
		} catch (error) {
			throw new Error(`Failed to get NFTs for owner ${ownerAddress}: ${error.message}`);
		}
	}

	async getNFTById(tokenId: string): Promise<NFT | null> {
		try {
			const [owner, tokenURI] = await Promise.all([
				this.contract.ownerOf(tokenId),
				this.contract.tokenURI(tokenId)
			]);

			return {
				tokenId,
				owner,
				tokenURI
			};
		} catch (error) {
			if (error.message.includes('ERC721NonexistentToken')) {
				return null;
			}
			throw new Error(`Failed to get NFT ${tokenId}: ${error.message}`);
		}
	}

	async getNFTMetadata(tokenId: string): Promise<any> {
		try {
			const tokenURI = await this.contract.tokenURI(tokenId);

			if (tokenURI.startsWith('ipfs://')) {
				const ipfsHash = tokenURI.replace('ipfs://', '');
				const metadataUrl = `${this.config.ipfsConfig.gatewayUrl}/${ipfsHash}`;

				const response = await fetch(metadataUrl);
				if (!response.ok) {
					return Promise.reject(`Failed to fetch metadata from IPFS: ${response.statusText}`);
				}
				return await response.json();
			}

			return { tokenURI };
		} catch (error) {
			throw new Error(`Failed to get metadata for token ${tokenId}: ${error.message}`);
		}
	}

	getContractAddress(): string {
		return this.config.ethConfig.contractAddress;
	}

	getRpcUrl(): string {
		return this.config.ethConfig.rpcUrl;
	}

	async getMintedNFTs(): Promise<NFT[]> {
		try {
			const allNFTsData = await this.getAllNFTs();
			return allNFTsData.nfts;
		} catch (error) {
			throw new Error(`Failed to get minted NFTs: ${error.message}`);
		}
	}

	async getAvailableToMint(): Promise<{ availableNFTs: AvailableNFT[]; nextTokenId: string }> {
		try {
			const [nextTokenId, predefinedURIs] = await Promise.all([
				this.contract.nextTokenId(),
				this.contract.getPredefinedMetadataURIs()
			]);

			const nextId = Number(nextTokenId);
			const availableNFTs: AvailableNFT[] = [];

			for (let i = 0; i < predefinedURIs.length; i++) {
				const tokenId = nextId + i;
				const metadataURI = predefinedURIs[i];

				if (metadataURI && metadataURI.trim() !== '') {
					try {
						const metadata = await this.fetchMetadataFromURI(metadataURI);
						availableNFTs.push({
							tokenId: tokenId.toString(),
							metadataURI,
							metadata
						});
					} catch (metadataError) {
						this.logger.warn(`Failed to fetch metadata for URI ${metadataURI}:`, metadataError.message);
						availableNFTs.push({
							tokenId: tokenId.toString(),
							metadataURI,
							metadata: null
						});
					}
				}
			}

			return {
				availableNFTs,
				nextTokenId: nextTokenId.toString()
			};
		} catch (error) {
			throw new Error(`Failed to get available NFTs to mint: ${error.message}`);
		}
	}

	private async fetchMetadataFromURI(uri: string): Promise<any> {
		if (uri.startsWith('ipfs://')) {
			const ipfsHash = uri.replace('ipfs://', '');
			const metadataUrl = `${this.config.ipfsConfig.gatewayUrl}/${ipfsHash}`;

			const response = await fetch(metadataUrl);
			if (!response.ok) {
				throw new Error(`Failed to fetch metadata from IPFS: ${response.statusText}`);
			}
			return await response.json();
		}

		const response = await fetch(uri);
		if (!response.ok) {
			throw new Error(`Failed to fetch metadata: ${response.statusText}`);
		}
		return await response.json();
	}
}
