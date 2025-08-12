# NFT Seeder

A TypeScript tool for seeding NFT images and metadata to the IPFS backend controller.

## Features

- Uploads NFT images to IPFS via backend API
- Creates and uploads NFT metadata with IPFS image references  
- Retry mechanism with configurable attempts and delays
- Comprehensive logging and error handling
- Progress tracking and summary reporting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### Environment Variables

- `BACKEND_URL`: Backend API URL (default: http://localhost:3000)
- `API_KEY`: API key for authentication (default: default-api-key-change-in-production)
- `MAX_RETRIES`: Maximum retry attempts for failed uploads (default: 3)
- `RETRY_DELAY`: Delay between retries in milliseconds (default: 2000)

### Running the Seeder

Make sure your backend server is running first:

```bash
# From the backend directory
cd ../../apps/be
npm run start:dev
```

Then run the seeder:

```bash
# Development mode (with ts-node)
npm run dev

# Production mode (compiled)
npm run seed

# With custom environment variables
API_KEY=your-secret-api-key BACKEND_URL=http://localhost:3000 MAX_RETRIES=5 npm run dev
```

## NFT Mapping

The seeder uses the `src/nfts-mapping.json` file which contains:

- NFT metadata (name, description, attributes)  
- Image file references pointing to `../assets/imgs/` (assets folder is inside the seeder)
- External URLs and styling information

## Output

The seeder will:

1. Upload each image file to IPFS via the backend
2. Create metadata with IPFS image references
3. Upload the metadata to IPFS
4. Provide a comprehensive summary of successful and failed uploads

## Error Handling

- Automatic retries for failed uploads
- Continues processing remaining NFTs if one fails
- Detailed error reporting in the final summary