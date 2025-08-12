import { NftSeeder } from './nft-seeder';
import { SeederConfig } from './types';
import 'dotenv/config';


async function main() {
  const config: SeederConfig = {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:1312',
    apiKey: process.env.API_KEY || '0feee7695743d402626d73643693696e33b385978b097deee7ab44d5854d8123',
    maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.RETRY_DELAY || '2000'),
  };

  console.log('🌱 NFT Seeder Tool');
  console.log('='.repeat(10));

  const seeder = new NftSeeder(config);

  try {
    await seeder.seedAllNfts();
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding process failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

export { NftSeeder };