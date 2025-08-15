import {Injectable, Inject, OnModuleInit, Logger} from '@nestjs/common';
import { ethers } from 'ethers';
import { CONFIG_PROVIDER } from '../config/config.provider';
import type { AppConfig } from '../config/config.types';
import {BasicCollectionInfo, ContractNFT} from "./eth.types";
import {EthContractFactory} from "./eth.factory";

@Injectable()
export class EthService {
	private readonly provider: ethers.JsonRpcProvider;
	private contract: ethers.Contract;
	private readonly logger = new Logger(EthService.name);

	constructor(@Inject(CONFIG_PROVIDER) private config: AppConfig) {
		this.provider = new ethers.JsonRpcProvider(this.config.ethConfig.rpcUrl);
		this.contract = EthContractFactory.createContract(this.provider, this.config.ethConfig.contractAddress);
	}

	async getCollectionInfo(): Promise<BasicCollectionInfo> {
		try {
			const [name, symbol, totalSupply, nextTokenId, registrationFee, mintingFee] = await Promise.all([
				this.contract.name(),
				this.contract.symbol(),
				this.contract.getTotalSupply(),
				this.contract.nextTokenId(),
				this.contract.registrationFee(),
				this.contract.mintingFee()
			]);

			return {
				contractAddress: this.config.ethConfig.contractAddress,
				name,
				symbol,
				totalSupply: totalSupply.toString(),
				nextTokenId: nextTokenId.toString(),
				registrationFee: registrationFee.toString(),
				mintingFee: mintingFee.toString()
			};
		} catch (error) {
			throw new Error(`Failed to get collection info: ${error.message}`);
		}
	}

	async getAllMintedNFTs(): Promise<ContractNFT[]> {
		try {
			const totalSupply = await this.contract.getTotalSupply();
			const nfts: ContractNFT[] = [];

			if (Number(totalSupply) === 0) {
				return nfts;
			}

			// Batch the calls to avoid rate limiting
			const batchSize = 5;
			for (let i = 1; i <= Number(totalSupply); i += batchSize) {
				const batch: ContractNFT[] = [];

				for (let tokenId = i; tokenId < i + batchSize && tokenId <= Number(totalSupply); tokenId++) {
					const minted = await this.getMintedNFTData(tokenId)

					if (minted) {
						batch.push(minted);
					}
				}

				try {
					const results = await Promise.allSettled(batch);

					results.forEach((result, index) => {
						if (result.status === 'fulfilled' && result.value) {
							nfts.push(result.value);
						} else if (result.status === 'rejected') {
							this.logger.warn(`Failed to get token ${i + index}:`, result.reason);
						}
					});

					// Add delay between batches to respect rate limits
					if (i + batchSize <= Number(totalSupply)) {
						await new Promise(resolve => setTimeout(resolve, 200));
					}
				} catch (batchError) {
					this.logger.error(`Batch failed for tokens ${i}-${Math.min(i + batchSize - 1, Number(totalSupply))}:`, batchError);
				}
			}

			return nfts;
		} catch (error) {
			this.logger.error('Failed to get minted NFTs:', error);
			throw new Error(`Failed to get minted NFTs: ${error.message}`);
		}
	}

	private async getMintedNFTData(tokenId: number): Promise<ContractNFT | null> {
		try {
			const [owner, tokenURI] = await Promise.all([
				this.contract.ownerOf(tokenId),
				this.contract.tokenURI(tokenId)
			]);

			return {
				tokenId: tokenId.toString(),
				owner,
				tokenURI
			};
		} catch (error) {
			if (error.message?.includes('Too Many Requests')) {
				// Wait and retry once
				await new Promise(resolve => setTimeout(resolve, 5_000));
				return this.getMintedNFTData(tokenId);
			}
			this.logger.warn(`Token ${tokenId} does not exist or failed:`, error.message);
			return null;
		}
	}



	async getPredefinedMetadataURIs(): Promise<string[]> {
		try {
			return await this.contract.getPredefinedMetadataURIs();
		} catch (error) {
			throw new Error(`Failed to get predefined metadata URIs: ${error.message}`);
		}
	}

}
