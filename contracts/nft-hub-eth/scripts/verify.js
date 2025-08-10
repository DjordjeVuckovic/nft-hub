import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  
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