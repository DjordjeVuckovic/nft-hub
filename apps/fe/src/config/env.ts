export type Environment = {
	ETH_CONTRACT_ADDRESS: string
	BACKEND_URL: string
}

export const environment: Environment = {
	ETH_CONTRACT_ADDRESS: import.meta.env.VITE_ETH_CONTRACT_ADDRESS,
	BACKEND_URL: import.meta.env.VITE_BACKEND_URL
}