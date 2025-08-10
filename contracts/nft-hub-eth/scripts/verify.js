import hre from "hardhat";
const { ethers } = hre;

import {config} from "dotenv";

config()

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
	console.error("Please set the CONTRACT_ADDRESS environment variable.");
	process.exit(1);
  }

  console.log("Verifying NFTHub contract at:", contractAddress);

  const NFTHub = await ethers.getContractFactory("NFTHub");
  const nftHub = NFTHub.attach(contractAddress);

  console.log("Contract owner:", await nftHub.owner());
  console.log("Registration fee:", ethers.formatEther(await nftHub.registrationFee()), "ETH");
  console.log("Minting fee:", ethers.formatEther(await nftHub.mintingFee()), "ETH");

  console.log("\nPredefined metadata URIs:");
  const metadataURIs = await nftHub.getPredefinedMetadataURIs();
  metadataURIs.forEach((uri, index) => {
    console.log(`${index}: ${uri}`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });