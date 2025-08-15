import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { useWallet } from './useWallet'
import nftHubABI from '@/abi/nft-hub.abi.json'
import {environment} from "@/config/env.ts";

const CONTRACT_ADDRESS = environment.ETH_CONTRACT_ADDRESS
const REGISTER_GAS_LIMIT = 100_000
const MINT_GAS_LIMIT = 300_000

interface UseNftHubReturn {
  isRegistered: boolean
  isBlacklisted: boolean
  registrationFee: string
  mintingFee: string

  isLoadingStatus: boolean
  isLoadingFees: boolean
  isLoadingRegister: boolean

  lastTxHash: string | null

  checkRegistrationStatus: () => Promise<void>
  fetchFees: () => Promise<void>
  register: () => Promise<{ success: boolean; error?: string; txHash?: string }>
  mint: (metadataIndex: number) => Promise<{ success: boolean; error?: string; txHash?: string }>

  refresh: () => Promise<void>
}

export function useEthContract(): UseNftHubReturn {
  const { isConnected, account, provider, signer } = useWallet()

  const [isRegistered, setIsRegistered] = useState(false)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [registrationFee, setRegistrationFee] = useState<string>('0')
  const [mintingFee, setMintingFee] = useState<string>('0')

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
      setRegistrationFee('0')
      setMintingFee('0')
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
        gasLimit: REGISTER_GAS_LIMIT
      })

      setLastTxHash(tx.hash)
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        setIsRegistered(true)
        return { success: true, txHash: tx.hash }
      } else {
        return { success: false, error: 'Transaction failed'}
      }
    } catch (err: any) {
      console.error('Registration error:', err)

			const errorMessage = buildErrMsg(err, 'Registration failed. Please try again.');

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
        gasLimit: MINT_GAS_LIMIT
      })

      setLastTxHash(tx.hash)
      const receipt = await tx.wait()

      if (receipt.status === 1) {
        return { success: true, txHash: tx.hash }
      } else {
        return { success: false, error: 'Transaction failed' }
      }
    } catch (err: any) {
      console.error('Minting error:', err)

			let errorMessage = buildErrMsg(err, 'Minting failed. Please try again.');

			return { success: false, error: errorMessage }
    }
  }, [signer, account, isRegistered, isBlacklisted])

  const refresh = useCallback(async () => {
    await Promise.all([
      checkRegistrationStatus(),
      fetchFees()
    ])
  }, [checkRegistrationStatus, fetchFees])

	function buildErrMsg(err: any, errorMessage: string = 'An error occurred') {
		switch (err.code) {
			case 'ACTION_REJECTED':
				errorMessage = 'Transaction was rejected by user'
				break
			case 'INSUFFICIENT_FUNDS':
				errorMessage = 'Insufficient funds to complete registration'
				break
			default:
				if (err.message?.includes('already registered')) {
					errorMessage = 'Address is already registered'
				} else if (err.message?.includes('blacklisted')) {
					errorMessage = 'Address is blacklisted'
				} else if (err.reason) {
					errorMessage = err.reason
				} else if (err.message) {
					errorMessage = err.message
				}
				break
		}
		return errorMessage;
	}

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