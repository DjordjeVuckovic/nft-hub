import {getNfts} from "@/api/nfts-api.ts";
import {useEffect, useState} from "react";
import type {NFTCollectionResponse} from "@/types/nft.ts";

export function useQueryNFTs() {
	const [nftData, setNftData] = useState<NFTCollectionResponse | null>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchNFTs = async (useCache: boolean = true) => {
		try {
			setLoading(true)
			setError(null)
			const data = await getNfts(useCache)
			setNftData(data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch NFTs')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchNFTs()
	}, [])

	const refresh = () => {
		fetchNFTs(false)
	}


	return {
		nftData,
		loading,
		error,
		refresh
	}
}