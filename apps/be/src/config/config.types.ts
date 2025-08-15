export type DbConfig = {
	uri: string;
	options: {}
}

export type AuthConfig = {
	jwtSecret: string;
	apiKey: string;
}

export type IpfsConfig = {
	gatewayUrl: string;
	pinataJwt: string;
	groupId?: string;
}

export type EthConfig = {
	rpcUrl: string;
	wsUrl: string;
	contractAddress: string;
	startBlock: number;
	rpcBlockLimit: number;
}

export type AppConfig = {
	port: number;
	dbConfig: DbConfig;
	ipfsConfig: IpfsConfig;
	authConfig: AuthConfig;
	ethConfig: EthConfig;
}