import nftAbi from './abi/nft-hub.abi.json';
import {ethers} from 'ethers';
import {Web3, WebSocketProvider} from 'web3'

export type Provider = ethers.JsonRpcProvider | ethers.Provider;

export class EthContractFactory {

	public static createContract(provider: Provider, contractAddress: string): ethers.Contract {
		try {

			const abi = Array.isArray(nftAbi) ? nftAbi : (nftAbi as any).default || nftAbi;

			return new ethers.Contract(
				contractAddress,
				abi,
				provider
			);
		} catch (error) {
			console.error('Failed to create Ethereum contract:', error);
			throw new Error(`Failed to create Ethereum contract: ${error.message}`);
		}
	}

	public static createWsContract(wsUrl: string, contractAddress: string) {
		const wsProvider = new WebSocketProvider(wsUrl, {}, {
			autoReconnect: true,
			maxAttempts: 10
		})

		const abi = Array.isArray(nftAbi) ? nftAbi : (nftAbi as any).default || nftAbi;

		const wsWeb3 = new Web3(wsProvider);

		return new wsWeb3.eth.Contract(abi, contractAddress, wsWeb3);
	}
}