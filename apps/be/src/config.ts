import { config as configDotenv } from 'dotenv';

export type DbConfig = {
    uri: string;
    options: {}
}

export type AuthConfig = {
    jwtSecret: string;
}

export type IpfsConfig = {
    apiUrl: string;
    gatewayUrl: string;
    projectId?: string;
    projectSecret?: string;
}

export type ServerConfig = {
    port: number;
    dbConfig: DbConfig;
    ipfsConfig: IpfsConfig;
    authConfig: AuthConfig;
}

// Backward compatibility function - deprecated, use ConfigProvider instead
export const loadConfig = (validate: boolean = false): ServerConfig => {
    configDotenv();

    const config: ServerConfig = {
        port: parseInt(process.env.PORT || '3000', 10),
        dbConfig: {
            uri: process.env.DB_URI || 'postgresql://ntf_user:ntf_password@localhost:5430/ntf_db',
            options: {}
        },
        ipfsConfig: {
            apiUrl: process.env.IPFS_API_URL || 'http://localhost:5001',
            gatewayUrl: process.env.IPFS_GATEWAY_URL || 'http://localhost:8080',
            projectId: process.env.IPFS_PROJECT_ID,
            projectSecret: process.env.IPFS_PROJECT_SECRET
        },
        authConfig: {
            jwtSecret: process.env.JWT_SECRET || 'supersecretkey'
        }
    };

    if (validate) {
        if (!config.dbConfig.uri) {
            throw new Error('DB_URI is required');
        }
        if (!config.ipfsConfig.apiUrl) {
            throw new Error('IPFS_API_URL is required');
        }
        if (!config.authConfig.jwtSecret) {
            throw new Error('JWT_SECRET is required');
        }
    }

    return config;
}