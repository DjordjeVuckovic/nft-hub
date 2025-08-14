import {createContext, type ReactNode, useContext, useEffect, useReducer} from 'react'
import {BrowserProvider, JsonRpcSigner} from 'ethers'
import {getNetworkByChainId, type Network} from '@/config/networks'

interface AuthState {
    isConnected: boolean
    account: string | null
    provider: BrowserProvider | null
    signer: JsonRpcSigner | null
    isConnecting: boolean
    error: string | null
    currentNetwork: Network | null
    isSwitchingNetwork: boolean
}

type AuthAction =
    | { type: 'CONNECT_START' }
    | { type: 'CONNECT_SUCCESS'; payload: { account: string; provider: BrowserProvider; signer: JsonRpcSigner } }
    | { type: 'CONNECT_ERROR'; payload: string }
    | { type: 'DISCONNECT' }
    | { type: 'ACCOUNT_CHANGED'; payload: string }
    | { type: 'NETWORK_CHANGED'; payload: Network | null }
    | { type: 'NETWORK_SWITCH_START' }
    | { type: 'NETWORK_SWITCH_SUCCESS'; payload: Network }
    | { type: 'NETWORK_SWITCH_ERROR'; payload: string }

interface AuthContextValue extends AuthState {
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    switchNetwork: (network: Network) => Promise<void>
    getCurrentNetwork: () => Network | null
}

const initialState: AuthState = {
    isConnected: false,
    account: null,
    provider: null,
    signer: null,
    isConnecting: false,
    error: null,
    currentNetwork: null,
    isSwitchingNetwork: false,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'CONNECT_START':
            return {
                ...state,
                isConnecting: true,
                error: null,
            }
        case 'CONNECT_SUCCESS':
            return {
                ...state,
                isConnected: true,
                isConnecting: false,
                account: action.payload.account,
                provider: action.payload.provider,
                signer: action.payload.signer,
                error: null,
            }
        case 'CONNECT_ERROR':
            return {
                ...state,
                isConnecting: false,
                error: action.payload,
            }
        case 'DISCONNECT':
            return {
                ...initialState,
            }
        case 'ACCOUNT_CHANGED':
            return {
                ...state,
                account: action.payload,
            }
        case 'NETWORK_CHANGED':
            return {
                ...state,
                currentNetwork: action.payload,
            }
        case 'NETWORK_SWITCH_START':
            return {
                ...state,
                isSwitchingNetwork: true,
                error: null,
            }
        case 'NETWORK_SWITCH_SUCCESS':
            return {
                ...state,
                isSwitchingNetwork: false,
                currentNetwork: action.payload,
                error: null,
            }
        case 'NETWORK_SWITCH_ERROR':
            return {
                ...state,
                isSwitchingNetwork: false,
                error: action.payload,
            }
        default:
            return state
    }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({children}: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    const connectWallet = async (): Promise<void> => {
        if (!window.ethereum) {
            dispatch({type: 'CONNECT_ERROR', payload: 'MetaMask is not installed'})
            return
        }

        dispatch({type: 'CONNECT_START'})

        const provider = new BrowserProvider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        await tryConnect(provider)
    }

    const tryConnect = async (provider: BrowserProvider): Promise<void> => {
        try {
            const signer = await provider.getSigner()
            const account = await signer.getAddress()

            const network = await provider.getNetwork()
            const currentNetwork = getNetworkByChainId(Number(network.chainId))

            dispatch({
                type: 'CONNECT_SUCCESS',
                payload: {account, provider, signer},
            })

            if (currentNetwork) {
                dispatch({type: 'NETWORK_CHANGED', payload: currentNetwork})
            }
        } catch (error: any) {
            dispatch({
                type: 'CONNECT_ERROR',
                payload: error.message || 'Failed to connect wallet',
            })
        }
    }

    const disconnectWallet = (): void => {
        dispatch({type: 'DISCONNECT'})
    }

    const switchNetwork = async (network: Network): Promise<void> => {
        if (!window.ethereum) {
            dispatch({type: 'NETWORK_SWITCH_ERROR', payload: 'MetaMask is not installed'})
            return
        }

        dispatch({type: 'NETWORK_SWITCH_START'})

        try {
            const chainIdHex = `0x${network.chainId.toString(16)}`

            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{chainId: chainIdHex}],
            })

            dispatch({type: 'NETWORK_SWITCH_SUCCESS', payload: network})
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: `0x${network.chainId.toString(16)}`,
                            chainName: network.name,
                            nativeCurrency: network.nativeCurrency,
                            rpcUrls: [network.rpcUrl],
                            blockExplorerUrls: [network.blockExplorer],
                        }],
                    })
                    dispatch({type: 'NETWORK_SWITCH_SUCCESS', payload: network})
                } catch (addError: any) {
                    dispatch({
                        type: 'NETWORK_SWITCH_ERROR',
                        payload: addError.message || 'Failed to add network',
                    })
                }
            } else {
                dispatch({
                    type: 'NETWORK_SWITCH_ERROR',
                    payload: error.message || 'Failed to switch network',
                })
            }
        }
    }

    const getCurrentNetwork = (): Network | null => {
        return state.currentNetwork
    }

    useEffect(() => {
        if (!window.ethereum) return

        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
                disconnectWallet()
            } else if (state.isConnected) {
                const verifyAccess = async () => {
                    try {
                        if (!window.ethereum) return
                        const provider = new BrowserProvider(window.ethereum)
                        const signer = await provider.getSigner()
                        const account = await signer.getAddress()
                        dispatch({type: 'ACCOUNT_CHANGED', payload: account})
                    } catch (error) {
                        disconnectWallet()
                    }
                }
                verifyAccess()
            }
        }

        const handleChainChanged = async (chainIdHex: string) => {
            try {
                const chainId = parseInt(chainIdHex, 16)
                const currentNetwork = getNetworkByChainId(chainId)
                dispatch({type: 'NETWORK_CHANGED', payload: currentNetwork as Network | null})

                if (state.isConnected && window.ethereum) {
                    try {
                        const provider = new BrowserProvider(window.ethereum)
                        const signer = await provider.getSigner()
                        const account = await signer.getAddress()

                        dispatch({
                            type: 'CONNECT_SUCCESS',
                            payload: {account, provider, signer},
                        })
                    } catch (error) {
                        console.error('Failed to update provider for new network:', error)
                    }
                }
            } catch (error) {
                console.error('Failed to handle chain change:', error)
            }
        }

        const checkWalletStatus = async () => {
            if (!state.isConnected) return

            try {
                await state.signer?.getAddress()
            } catch (error) {
                disconnectWallet()
            }
        }

        const statusInterval = setInterval(checkWalletStatus, 3000)

        window.ethereum.on('accountsChanged', handleAccountsChanged)
        window.ethereum.on('chainChanged', handleChainChanged)

        return () => {
            window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
            window.ethereum?.removeListener('chainChanged', handleChainChanged)
            clearInterval(statusInterval)
        }
    }, [state.isConnected, state.signer])

    useEffect(() => {
        const checkConnection = async () => {
            if (!window.ethereum) return

            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                })

                if (accounts && accounts.length > 0) {
                    const provider = new BrowserProvider(window.ethereum)
                    tryConnect(provider)
                }
            } catch (error) {
                console.error('Failed to check wallet connection:', error)
            }
        }

        checkConnection()
    }, [])

    useEffect(() => {
        if (!window.ethereum) return

        const detectCurrentNetwork = async () => {
            try {
                const chainIdHex = await window.ethereum?.request({method: 'eth_chainId'})
                const chainId = parseInt(chainIdHex, 16)
                const currentNetwork = getNetworkByChainId(chainId)

                if (!state.currentNetwork || state.currentNetwork.chainId !== chainId) {
                    dispatch({type: 'NETWORK_CHANGED', payload: currentNetwork as Network | null})
                }
            } catch (error) {
                console.error('Failed to detect current network:', error)
            }
        }

        detectCurrentNetwork()
    }, [state.currentNetwork])

    return (
        <AuthContext.Provider
            value={{
                ...state,
                connectWallet,
                disconnectWallet,
                switchNetwork,
                getCurrentNetwork,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}