import nftAbi from './abi/nft-hub.abi.json';
import { ethers } from 'ethers';

export type Provider = ethers.JsonRpcProvider | ethers.Provider;

export class EthContractFactory {
	public static createContract(provider: Provider, contractAddress: string): ethers.Contract {
		try {
			const abi = Array.isArray(nftAbi) ? nftAbi : (nftAbi as any).default || nftAbi;

			return new ethers.Contract(contractAddress, abi, provider);
		} catch (error) {
			console.error('Failed to create Ethereum contract:', error);
			throw new Error(`Failed to create Ethereum contract: ${error.message}`);
		}
	}
}
