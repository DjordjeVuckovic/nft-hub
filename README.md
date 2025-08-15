# NFT Hub

A comprehensive Web3 application for NFT registration, minting, and management on the blockchain. NFT Hub provides a complete ecosystem including smart contracts, backend API services, and a modern React frontend for seamless NFT operations.

## Architecture

This monorepo contains three interconnected components:

- **`apps/frontend/`** - React frontend application with Web3 integration
- **`apps/backend/`** - NestJS backend API server with blockchain event listening
- **`contracts/`** - Solidity smart contracts for NFT operations
- **`tools/`** - Developer tools and utilities

## Features

### Smart Contract (Solidity)
- **User Registration System** - Paid registration with blacklist protection
- **NFT Minting** - ERC721 NFT minting for registered users only
- **Blacklist Management** - Admin-controlled blacklist functionality
- **Event Emission** - Comprehensive event logging for all operations
- **IPFS Integration** - Metadata storage with 10 predefined NFT collections
- **Fee Management** - Configurable registration and minting fees
- **Access Control** - Owner-only administrative functions

### Backend API (NestJS)
- **Event Listener** - Real-time blockchain event monitoring
- **MongoDB Integration** - Persistent event storage and querying
- **RESTful API** - Clean endpoints for event and NFT data
- **IPFS Gateway** - Pinata integration for metadata and image serving
- **Caching System** - Performance optimization with cache management
- **API Security** - API key authentication for protected endpoints

### Frontend (React)
- **Wallet Integration** - Web3 wallet connection with Wagmi/Viem
- **User Registration** - Intuitive registration flow with payment handling
- **NFT Minting Interface** - Simple minting with metadata selection
- **NFT Gallery** - Beautiful gallery with Etherscan integration
- **Responsive Design** - Modern UI with dark/light theme support
- **Network Management** - Multi-network support with automatic switching

## Quick Start

### Prerequisites

- **Node.js** >= 18
- **npm** >= 10.8.0
- **Docker** (for database)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nft-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the database**
   ```bash
   docker-compose up -d
   ```

4. **Start all services**
   ```bash
   npm run dev:all
   ```

   Or start services individually:
   ```bash
   npm run dev:fe    # Frontend (http://localhost:5173)
   npm run dev:be    # Backend (http://localhost:1312)
   ```

## Development

### Environment Setup

Create `.env` files in the appropriate directories(observe `.env.example` files for reference):

**`contracts/nft-hub-eth/.env`**

**`apps/backend/.env`**

**`apps/frontend/.env`**

### Smart Contract Development

```bash
cd contracts/nft-hub-eth

npm run compile

npm run test

npm run node
npm run deploy:localhost

npm run deploy:test

npm run verify:test
```

### Backend Development

```bash
cd apps/be

npm run dev

npm run test
npm run test:e2e

npm run build

npm run lint
npm run format:check
```

### Frontend Development

```bash
cd apps/fe

npm run dev

npm run build

npm run preview

npm run lint
```

## API Reference

- You can access the backend API documentation at `http://localhost:1312/scalar` after starting the backend server.

## Testing

### Run All Tests

```bash
npm run test

npm run test:frontend
npm run test:backend  
npm run test:contracts
```

### Smart Contract Testing

```bash
cd contracts/nft-hub-eth
npm run test              
npm run coverage          
```

### Backend Testing

```bash
cd apps/be
npm run test              
```

##  Build & Deployment

### Build All Applications

```bash
npm run build
```

### Deploy Smart Contract

```bash
cd contracts/nft-hub-eth

npm run deploy:test

npm run verify:test
```

### Copy Contract ABI

After deploying contracts, copy the ABI to frontend and backend:

```bash
npm run cp-abi:be

npm run cp-abi:fe
```

##  Database

The application uses MongoDB for event storage:

- **Container**: `ntf-db`
- **Port**: `27017`
- **Database**: `ntf_db`
- **Host**: `localhost:27017`

Start the database:
```bash
docker-compose up -d
```

### Network Configuration

Networks are configured in:
- **Smart Contracts**: `contracts/nft-hub-eth/hardhat.config.js`
- **Frontend**: `apps/fe/src/config/networks.ts`

## Utilities & Tools

### NFT Seeder Tool

Located in `tools/nft-seeder/` - generates NFT metadata and uploads to IPFS:

```bash
cd tools/nft-seeder
npm run seed
```

## Frontend Features

### Pages & Components

- **Home** (`/`) - Landing page with project overview
- **Register** (`/register`) - User registration with wallet integration
- **Mint** (`/mint`) - NFT minting interface for registered users
- **Gallery** (`/gallery`) - NFT collection viewer with Etherscan links

### Key Components

- **Wallet Connection** - Multi-wallet support with automatic network detection
- **Theme System** - Dark/light mode with system preference detection
- **Network Selector** - Easy network switching
- **NFT Cards** - Rich NFT display with metadata
- **Navigation** - Responsive navigation with wallet status

## Workflow

### Complete User Journey

1. **Connect Wallet** - User connects Web3 wallet
2. **Register** - Pay registration fee to join platform
3. **Mint NFT** - Select from 10 predefined metadata options and mint
4. **View Gallery** - Browse minted NFTs with creator links to Etherscan
5. **Event Tracking** - All actions logged and queryable via API

### Development Workflow

1. **Start Database** - `docker-compose up -d`
2. **Deploy Contracts** - Deploy and verify smart contracts
3. **Copy ABIs** - Update frontend/backend with contract interface
4. **Start Services** - Launch backend event listener and frontend
5. **Test Integration** - Verify end-to-end functionality

## Code Quality

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Type checking
npm run typecheck

# Format code (where available)
npm run format:check
```