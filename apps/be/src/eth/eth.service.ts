import {Injectable, Inject, OnModuleInit, Logger} from '@nestjs/common';
import { ethers } from 'ethers';
import { CONFIG_PROVIDER } from '../config/config.provider';
import type { AppConfig } from '../config/config.types';
import nftAbi from './abi/nft-hub.abi.json';
import {BasicCollectionInfo, ContractNFT} from "./eth.types";

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

			for (let tokenId = 0; tokenId < Number(totalSupply); tokenId++) {
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
					this.logger.warn(`Token ${tokenId} does not exist:`, tokenError.message);
				}
			}

			return nfts;
		} catch (error) {
			throw new Error(`Failed to get minted NFTs: ${error.message}`);
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
