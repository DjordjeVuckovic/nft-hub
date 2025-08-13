import hre from "hardhat";
import "dotenv/config";
import { loadNftMetadataUris } from "./nft-data-loader.js";
import {MINTING_FEE, REGISTRATION_FEE} from "./consts.js";


async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    console.error("Please set CONTRACT_ADDRESS in your .env file");
    process.exit(1);
  }

  console.log(`Verifying contract at address: ${contractAddress}`);

  const metadataURIs = await loadNftMetadataUris();

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [
				REGISTRATION_FEE,
				MINTING_FEE,
				metadataURIs
			],
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
  }
}

main().catch(console.error);