import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import nftHubABI from '@/eth/abi/nft-hub.abi.json'

const CONTRACT_ADDRESS = import.meta.env.VITE_ETH_CONTRACT_ADDRESS

interface UseNftHubReturn {
  // Contract data
  isRegistered: boolean
  isBlacklisted: boolean
  registrationFee: string
  mintingFee: string

  // Loading states
  isLoadingStatus: boolean
  isLoadingFees: boolean
  isLoadingRegister: boolean

  // Transaction data
  lastTxHash: string | null

  // Functions
  checkRegistrationStatus: () => Promise<void>
  fetchFees: () => Promise<void>
  register: () => Promise<{ success: boolean; error?: string; txHash?: string }>
  mint: (metadataIndex: number) => Promise<{ success: boolean; error?: string; txHash?: string }>

  // Utility
  refresh: () => Promise<void>
}

export function useNftHubContract(): UseNftHubReturn {
  const { isConnected, account, provider, signer } = useWallet()

  const [isRegistered, setIsRegistered] = useState(false)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [registrationFee, setRegistrationFee] = useState<string>('0.01')
  const [mintingFee, setMintingFee] = useState<string>('0.01')

  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [isLoadingFees, setIsLoadingFees] = useState(false)
  const [isLoadingRegister, setIsLoadingRegister] = useState(false)

  const [lastTxHash, setLastTxHash] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && account && provider) {
      refresh()
    } else {
      setIsRegistered(false)
      setIsBlacklisted(false)
      setRegistrationFee('0.01')
      setMintingFee('0.01')
      setLastTxHash(null)
    }
  }, [isConnected, account, provider])

  const checkRegistrationStatus = useCallback(async () => {
    if (!provider || !account) return

    setIsLoadingStatus(true)
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftHubABI, provider)
      const [registered, blacklisted] = await Promise.all([
        contract.isRegistered(account),
        contract.isBlacklisted(account)
      ])

      setIsRegistered(registered)
      setIsBlacklisted(blacklisted)
    } catch (err) {
      console.error('Error checking registration status:', err)
      setIsRegistered(false)
      setIsBlacklisted(false)
    } finally {
      setIsLoadingStatus(false)
    }
  }, [provider, account])

  const fetchFees = useCallback(async () => {
    if (!provider) return

    setIsLoadingFees(true)
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftHubABI, provider)
      const [regFee, mintFee] = await Promise.all([
        contract.registrationFee(),
        contract.mintingFee()
      ])

      setRegistrationFee(ethers.formatEther(regFee))
      setMintingFee(ethers.formatEther(mintFee))
    } catch (err) {
      console.error('Error fetching fees:', err)
    } finally {
      setIsLoadingFees(false)
    }
  }, [provider])

  const register = useCallback(async (): Promise<{ success: boolean; error?: string; txHash?: string }> => {
    if (!signer || !account) {
      return { success: false, error: 'Please connect your wallet first' }
    }

    if (isBlacklisted) {
      return { success: false, error: 'Your address is blacklisted and cannot register' }
    }

    if (isRegistered) {
      return { success: false, error: 'You are already registered' }
    }

    setIsLoadingRegister(true)
    setLastTxHash(null)

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftHubABI, signer)
      const fee = await contract.registrationFee()

      const tx = await contract.register({
        value: fee,
        gasLimit: 100000
      })

      setLastTxHash(tx.hash)
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        // Update local state immediately
        setIsRegistered(true)
        return { success: true, txHash: tx.hash }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (err: any) {
      console.error('Registration error:', err)

      let errorMessage = 'Registration failed. Please try again.'

      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user'
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to complete registration'
      } else if (err.message?.includes('already registered')) {
        errorMessage = 'Address is already registered'
      } else if (err.message?.includes('blacklisted')) {
        errorMessage = 'Address is blacklisted'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }

      return { success: false, error: errorMessage }
    } finally {
      setIsLoadingRegister(false)
    }
  }, [signer, account, isBlacklisted, isRegistered])

  const mint = useCallback(async (metadataIndex: number): Promise<{ success: boolean; error?: string; txHash?: string }> => {
    if (!signer || !account) {
      return { success: false, error: 'Please connect your wallet first' }
    }

    if (!isRegistered) {
      return { success: false, error: 'You must be registered to mint NFTs' }
    }

    if (isBlacklisted) {
      return { success: false, error: 'Your address is blacklisted and cannot mint' }
    }

    setLastTxHash(null)

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, nftHubABI, signer)
      const fee = await contract.mintingFee()

      const tx = await contract.mint(metadataIndex, {
        value: fee,
        gasLimit: 150000
      })

      setLastTxHash(tx.hash)
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        return { success: true, txHash: tx.hash }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (err: any) {
      console.error('Minting error:', err)

      let errorMessage = 'Minting failed. Please try again.'

      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction was rejected by user'
      } else if (err.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds to complete minting'
      } else if (err.message?.includes('not registered')) {
        errorMessage = 'You must be registered to mint NFTs'
      } else if (err.message?.includes('blacklisted')) {
        errorMessage = 'Address is blacklisted'
      } else if (err.reason) {
        errorMessage = err.reason
      } else if (err.message) {
        errorMessage = err.message
      }

      return { success: false, error: errorMessage }
    }
  }, [signer, account, isRegistered, isBlacklisted])

  const refresh = useCallback(async () => {
    await Promise.all([
      checkRegistrationStatus(),
      fetchFees()
    ])
  }, [checkRegistrationStatus, fetchFees])

  return {
    isRegistered,
    isBlacklisted,
    registrationFee,
    mintingFee,

    isLoadingStatus,
    isLoadingFees,
    isLoadingRegister,

    lastTxHash,

    checkRegistrationStatus,
    fetchFees,
    register,
    mint,

    refresh
  }
}