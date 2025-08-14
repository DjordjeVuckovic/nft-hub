
const shortenAddress = (addr?: string | null) => {
	if (!addr) return null
	return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export {
	shortenAddress
}