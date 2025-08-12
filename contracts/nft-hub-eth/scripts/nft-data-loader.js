import fs from "fs/promises";
import path from "path";

/**
 * Load NFT data from assets/nft-data.json and extract metadata URIs
 * @returns {Promise<string[]>} Array of metadata URIs
 */
export async function loadNftMetadataUris() {
  const nftDataPath = path.join(process.cwd(), "assets", "nft-data.json");

  try {
    const rawData = await fs.readFile(nftDataPath, "utf8");
    const nftData = JSON.parse(rawData);
    console.log(`Loaded ${nftData.length} NFT metadata URIs`);

    return nftData.map(nft => nft.metadataUri);
  } catch (error) {
    console.error("Error loading NFT data:", error.message);
    console.log("Proceeding with empty metadata array");
    return [];
  }
}
