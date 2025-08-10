# NFT Hub Smart Contract

This directory contains the NFTHub smart contract implementation for the NFT Hub Web3 application.

## Contract Overview

The `NFTHub` contract is an ERC-721 compliant NFT contract that includes:

- **Paid Registration System**: Users must pay a fee to register before minting NFTs
- **Paid NFT Minting**: Only registered users can mint NFTs for a fee
- **Blacklist Management**: Admin can blacklist addresses from registration and minting
- **Event Emission**: All major actions emit events for backend tracking
- **IPFS Integration**: Pre-configured metadata URIs for 10 different NFTs
- **Pausable Operations**: Contract can be paused by admin
- **Fund Withdrawal**: Owner can withdraw collected fees

## Key Features

### Registration System
- Users must pay `registrationFee` (default: 0.01 ETH) to register
- Blacklisted users cannot register
- Registration emits `UserRegistered` event

### NFT Minting
- Only registered, non-blacklisted users can mint
- Minting costs `mintingFee` (default: 0.005 ETH)
- Users select from 10 pre-configured IPFS metadata URIs
- Each mint emits `NFTMinted` event with metadata URI

### Administrative Functions
- Add/remove addresses from blacklist
- Update registration and minting fees
- Update predefined metadata URIs
- Pause/unpause contract operations
- Withdraw collected fees

## Contract Interface

### User Functions
```solidity
function register() external payable
function mint(uint256 metadataIndex) external payable
```

### Administrative Functions
```solidity
function addToBlacklist(address user) external onlyOwner
function removeFromBlacklist(address user) external onlyOwner
function setFees(uint256 _registrationFee, uint256 _mintingFee) external onlyOwner
function updateMetadataURI(uint256 index, string calldata newURI) external onlyOwner
function pause() external onlyOwner
function unpause() external onlyOwner
function withdraw() external onlyOwner
```

### View Functions
```solidity
function isRegistered(address user) external view returns (bool)
function isBlacklisted(address user) external view returns (bool)
function getTotalSupply() external view returns (uint256)
function getPredefinedMetadataURIs() external view returns (string[10] memory)
```

## Events

- `UserRegistered(address indexed user, uint256 timestamp)`
- `NFTMinted(address indexed to, uint256 indexed tokenId, string metadataURI, uint256 timestamp)`
- `UserBlacklisted(address indexed user, uint256 timestamp)`
- `UserRemovedFromBlacklist(address indexed user, uint256 timestamp)`
- `FeesUpdated(uint256 registrationFee, uint256 mintingFee, uint256 timestamp)`

## Development Commands

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to localhost
npm run node          # Terminal 1: Start Hardhat node
npm run deploy:localhost  # Terminal 2: Deploy contract

# Clean build artifacts
npm run clean
```

## Deployment

1. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Deploy to testnet:
   ```bash
   npm run deploy -- --network sepolia
   ```

## Test Coverage

The contract includes comprehensive tests covering:
- Contract deployment and initialization
- User registration with various scenarios
- NFT minting functionality
- Blacklist management
- Fee management
- Metadata URI updates
- Withdrawal functionality
- Pausable operations
- All view functions

Run tests with: `npm test`

## Security Features

- ReentrancyGuard: Protects against reentrancy attacks
- Ownable: Restricts administrative functions to contract owner
- Pausable: Allows emergency pause of operations
- Input validation: Comprehensive checks on all parameters
- Excess payment refunds: Automatically refunds overpayment

## IPFS Integration

The contract comes with 10 predefined IPFS metadata URIs. Update these with actual IPFS hashes:

```solidity
string[10] public predefinedMetadataURIs = [
    "ipfs://QmYourActualHash1/metadata1.json",
    // ... update all 10 URIs
];
```

## Gas Optimization

- Uses optimized OpenZeppelin contracts
- Efficient storage layout
- Minimal external calls
- Gas-optimized loops and operations