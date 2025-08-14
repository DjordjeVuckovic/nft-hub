
import hre from "hardhat";
const { ethers } = hre;
import { config } from "dotenv";
import { loadNftMetadataUris } from "./nft-data-loader.js";
import {MINTING_FEE, REGISTRATION_FEE} from "./consts.js";

config()

async function main() {
  console.log("Deploying NFTHub contract...");

  const metadataURIs = await loadNftMetadataUris();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  const NFTHub = await ethers.getContractFactory("NFTHub");
  const nftHub = await NFTHub.deploy(REGISTRATION_FEE, MINTING_FEE, metadataURIs);

  await nftHub.waitForDeployment();
  const contractAddress = await nftHub.getAddress();

  console.log("🚀 NFTHub deployed to:", contractAddress);
  console.log("Transaction hash:", nftHub.deploymentTransaction().hash);

  console.log("\nContract configuration:");
  console.log("Registration fee:", await nftHub.registrationFee());
  console.log("Minting fee:", await nftHub.mintingFee());
  console.log("Contract owner:", await nftHub.owner());

  return {
    nftHub,
    contractAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });