# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NFT Hub is a Web3 application consisting of 3 interconnected components that allow users to register and mint NFTs on the blockchain. The system includes user registration, NFT minting (both paid transactions), blacklist functionality, and comprehensive event tracking.

## Architecture

This is a monorepo with the following structure:
- `apps/frontend/` - React frontend application
- `apps/backend/` - Nest.js backend API server
- `contracts/` - Solidity smart contracts
- `packages/` - Shared packages and utilities
- `docker-compose.yaml` - PostgreSQL database (port 5430)

## System Components

### Smart Contract Requirements
- User registration system (paid transaction)
- NFT minting functionality (paid transaction, registered users only)
- Blacklist management (deployer/admin only)
- Event emission for all major actions (registration, minting, blacklisting)
- IPFS integration for NFT metadata (10 pre-configured NFTs)

### Backend (Nest.js)
- Event listener for blockchain events
- PostgreSQL database integration
- GET `/events/{address}` - retrieve all events for specific address
- POST `/blacklist` - admin endpoint to add addresses to blacklist (bonus feature)
- Event storage: registration, minting, blacklisting events

### Frontend (React)
- User registration interface
- NFT minting interface (registered users only)
- NFT gallery with creator addresses linking to Etherscan
- Blacklist status handling
- Web3 wallet integration

## Key Business Rules

1. **Paid Transactions**: Both registration and minting require payment
2. **Access Control**: Only registered users can mint NFTs
3. **Blacklist System**: Blacklisted addresses cannot register or mint
4. **Admin Privileges**: Only contract deployer can manage blacklist
5. **Event Tracking**: All contract events must be stored and queryable by address
6. **IPFS Storage**: NFT metadata stored on IPFS (10 predefined NFTs)

## Development Commands

```bash
# Install dependencies (monorepo root)
npm install

# Start all services
npm run dev

# Start individual services
npm run dev:frontend
npm run dev:backend
npm run dev:contracts

# Database
docker-compose up -d  # Start PostgreSQL on port 5430

# Build all apps
npm run build

# Run tests
npm run test
npm run test:frontend
npm run test:backend
npm run test:contracts

# Deploy contracts
npm run deploy:contracts

# Linting and type checking
npm run lint
npm run typecheck
```

## Database Configuration

PostgreSQL container configured in docker-compose.yaml:
- Host: localhost:5430
- Database: ntf_db
- User: ntf_user
- Password: ntf_password

## Frontend Features

- Connect wallet functionality
- Registration form with payment handling
- NFT minting interface
- Gallery view showing minted NFTs
- Creator address display with Etherscan links
- Responsive design (based on Figma prototype)

## Contract Integration

- Event listeners for: Registration, Minting, Blacklisting
- Web3 provider integration
- Transaction handling and error management
- IPFS metadata retrieval

## Testing Strategy

- Smart contract unit tests (Hardhat/Foundry)
- Backend API endpoint tests
- Frontend component and integration tests
- E2E workflow testing (registration → minting → event tracking)

## Deployment Notes

- Smart contracts deployed to test network
- Frontend configured for testnet interaction
- Backend environment variables for database and RPC endpoints
- IPFS gateway configuration for metadata retrieval