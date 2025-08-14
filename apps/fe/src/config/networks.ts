export type Network = {
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
  }
}


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