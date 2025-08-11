import { config as configDotenv } from 'dotenv';

export type DbConfig = {
    uri: string;
    options: {}
}

export type AuthConfig = {
    jwtSecret: string;
}

export type IpfsConfig = {
    gatewayUrl: string;
    pinataJwt: string;
    groupId: string;
}

export type EthConfig = {
	rpcUrl: string;
	wsUrl: string;
	contractAddress: string;
}

export type AppConfig = {
    port: number;
    dbConfig: DbConfig;
    ipfsConfig: IpfsConfig;
    authConfig: AuthConfig;
	ethConfig: EthConfig;
}

export declare const CONFIG_PROVIDER = 'CONFIG';

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