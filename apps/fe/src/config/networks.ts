export interface Network {
  id: string
  chainId: number
  name: string
  shortName: string
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  testnet: boolean
}

export const NETWORKS: Record<string, Network> = {
  ethereum: {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    rpcUrl: 'https://ethereum.publicnode.com',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    testnet: false
  },
  sepolia: {
    id: 'sepolia',
    chainId: 11155111,
    name: 'Sepolia Testnet',
    shortName: 'Sepolia',
    rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    blockExplorer: 'https://sepolia.etherscan.io',
    nativeCurrency: {
      name: 'Sepolia Ether',
      symbol: 'SepoliaETH',
      decimals: 18
    },
    testnet: true
  },
  arbitrum: {
    id: 'arbitrum',
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    rpcUrl: 'https://arbitrum-one.publicnode.com',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    testnet: false
  },
  arbitrumSepolia: {
    id: 'arbitrumSepolia',
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    shortName: 'Arb Sepolia',
    rpcUrl: 'https://arbitrum-sepolia.publicnode.com',
    blockExplorer: 'https://sepolia.arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    },
    testnet: true
  },
  polygon: {
    id: 'polygon',
    chainId: 137,
    name: 'Polygon Mainnet',
    shortName: 'Polygon',
    rpcUrl: 'https://polygon-bor.publicnode.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18
    },
    testnet: false
  },
  polygonAmoy: {
    id: 'polygonAmoy',
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    shortName: 'Amoy',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    testnet: true
  },
  bsc: {
    id: 'bsc',
    chainId: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    rpcUrl: 'https://bsc.publicnode.com',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    testnet: false
  },
  bscTestnet: {
    id: 'bscTestnet',
    chainId: 97,
    name: 'BNB Smart Chain Testnet',
    shortName: 'BSC Testnet',
    rpcUrl: 'https://bsc-testnet.publicnode.com',
    blockExplorer: 'https://testnet.bscscan.com',
    nativeCurrency: {
      name: 'tBNB',
      symbol: 'tBNB',
      decimals: 18
    },
    testnet: true
  }
}

export const DEFAULT_NETWORK = NETWORKS.sepolia // Start with testnet

export function getNetworkByChainId(chainId: number): Network | undefined {
  return Object.values(NETWORKS).find(network => network.chainId === chainId)
}

export function isValidNetwork(chainId: number): boolean {
  return !!getNetworkByChainId(chainId)
}

export function getMainnetNetworks(): Network[] {
  return Object.values(NETWORKS).filter(network => !network.testnet)
}

export function getTestnetNetworks(): Network[] {
  return Object.values(NETWORKS).filter(network => network.testnet)
}