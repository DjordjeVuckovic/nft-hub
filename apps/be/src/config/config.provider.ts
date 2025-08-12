import {config as configDotenv} from 'dotenv';
import {AppConfig} from "./config.types";

export const CONFIG_PROVIDER = 'CONFIG';

export const ConfigProvider = {
	provide: CONFIG_PROVIDER,
	useFactory: (): AppConfig => {
		configDotenv();

		return {
			port: parseInt(process.env.PORT || '3000', 10),
			dbConfig: {
				uri: process.env.DB_URI || 'postgresql://ntf_user:ntf_password@localhost:5430/ntf_db',
				options: {}
			},
			ipfsConfig: {
				gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs',
				pinataJwt: process.env.PINATA_JWT || '',
				groupId: process.env.PINATA_GROUP_ID || ''
			},
			authConfig: {
				jwtSecret: process.env.JWT_SECRET || 'supersecretkey'
			},
			ethConfig: {
				rpcUrl: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY',
				wsUrl: process.env.ETH_WS_URL || 'wss://mainnet.infura.io/ws/v3/YOUR_INFURA_API_KEY',
				contractAddress: process.env.ETH_CONTRACT_ADDRESS || '0xYourContractAddress'
			}
		};
	},
};