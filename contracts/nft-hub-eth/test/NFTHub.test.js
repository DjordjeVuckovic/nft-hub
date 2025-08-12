import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("NFTHub", function () {
  let nftHub;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const registrationFee = ethers.parseEther("0.01");
    const mintingFee = ethers.parseEther("0.005");
    const metadataURIs = [
      "ipfs://QmHash1/metadata1.json",
      "ipfs://QmHash2/metadata2.json",
      "ipfs://QmHash3/metadata3.json",
      "ipfs://QmHash4/metadata4.json",
      "ipfs://QmHash5/metadata5.json",
      "ipfs://QmHash6/metadata6.json",
      "ipfs://QmHash7/metadata7.json",
      "ipfs://QmHash8/metadata8.json",
      "ipfs://QmHash9/metadata9.json",
      "ipfs://QmHash10/metadata10.json"
    ];

    const NFTHub = await ethers.getContractFactory("NFTHub");
    nftHub = await NFTHub.deploy(registrationFee, mintingFee, metadataURIs);
    await nftHub.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftHub.owner()).to.equal(owner.address);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await nftHub.name()).to.equal("NftHubCollection");
      expect(await nftHub.symbol()).to.equal("NftHub");
    });

    it("Should set correct fees", async function () {
      expect(await nftHub.registrationFee()).to.equal(ethers.parseEther("0.01"));
      expect(await nftHub.mintingFee()).to.equal(ethers.parseEther("0.005"));
    });

    it("Should initialize with predefined metadata URIs", async function () {
      const uris = await nftHub.getPredefinedMetadataURIs();
      const maxURIs = await nftHub.MAX_METADATA_URIS();

      expect(uris.length).to.equal(maxURIs);
      expect(uris[0]).to.equal("ipfs://QmHash1/metadata1.json");
      expect(uris[uris.length - 1]).to.equal("ipfs://QmHash10/metadata10.json");
    });

    it("Should reject deployment with zero registration fee", async function () {
      const NFTHub = await ethers.getContractFactory("NFTHub");
      const metadataURIs = ["ipfs://QmHash1/metadata1.json"];

      await expect(NFTHub.deploy(0, ethers.parseEther("0.005"), metadataURIs))
        .to.be.revertedWith("Registration fee must be greater than 0");
    });

    it("Should reject deployment with zero minting fee", async function () {
      const NFTHub = await ethers.getContractFactory("NFTHub");
      const metadataURIs = ["ipfs://QmHash1/metadata1.json"];

      await expect(NFTHub.deploy(ethers.parseEther("0.01"), 0, metadataURIs))
        .to.be.revertedWith("Minting fee must be greater than 0");
    });

    it("Should reject deployment with empty metadata URIs", async function () {
      const NFTHub = await ethers.getContractFactory("NFTHub");

      await expect(NFTHub.deploy(ethers.parseEther("0.01"), ethers.parseEther("0.005"), []))
        .to.be.revertedWith("Invalid metadata URIs count");
    });

    it("Should reject deployment with too many metadata URIs", async function () {
      const NFTHub = await ethers.getContractFactory("NFTHub");
      const metadataURIs = Array(11).fill().map((_, i) => `ipfs://QmHash${i + 1}/metadata${i + 1}.json`);

      await expect(NFTHub.deploy(ethers.parseEther("0.01"), ethers.parseEther("0.005"), metadataURIs))
        .to.be.revertedWith("Invalid metadata URIs count");
    });

    it("Should reject deployment with empty metadata URI", async function () {
      const NFTHub = await ethers.getContractFactory("NFTHub");
      const metadataURIs = ["ipfs://QmHash1/metadata1.json", ""];

      await expect(NFTHub.deploy(ethers.parseEther("0.01"), ethers.parseEther("0.005"), metadataURIs))
        .to.be.revertedWith("Empty metadata URI not allowed");
    });
  });

  describe("User Registration", function () {
    it("Should allow user registration with correct fee", async function () {
      const registrationFee = await nftHub.registrationFee();

      await expect(nftHub.connect(user1).register({ value: registrationFee }))
        .to.emit(nftHub, "UserRegistered");

      expect(await nftHub.isRegistered(user1.address)).to.be.true;
    });

    it("Should reject registration with insufficient fee", async function () {
      const insufficientFee = ethers.parseEther("0.0005");

      await expect(nftHub.connect(user1).register({ value: insufficientFee }))
        .to.be.revertedWith("Insufficient registration fee");
    });

    it("Should reject duplicate registration", async function () {
      const registrationFee = await nftHub.registrationFee();

      await nftHub.connect(user1).register({ value: registrationFee });

      await expect(nftHub.connect(user1).register({ value: registrationFee }))
        .to.be.revertedWith("User already registered");
    });

    it("Should reject registration from blacklisted user", async function () {
      await nftHub.addToBlacklist(user1.address);
      const registrationFee = await nftHub.registrationFee();

      await expect(nftHub.connect(user1).register({ value: registrationFee }))
        .to.be.revertedWith("User is blacklisted");
    });

    it("Should refund excess payment", async function () {
      const registrationFee = await nftHub.registrationFee();
      const excessAmount = registrationFee + ethers.parseEther("0.01");

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const tx = await nftHub.connect(user1).register({ value: excessAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(user1.address);
      const expectedBalance = initialBalance - registrationFee - gasUsed;

      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });

  describe("NFT Minting", function () {
    beforeEach(async function () {
      const registrationFee = await nftHub.registrationFee();
      await nftHub.connect(user1).register({ value: registrationFee });
    });

    it("Should allow registered user to mint NFT", async function () {
      const mintingFee = await nftHub.mintingFee();
      const metadataIndex = 0;

      await expect(nftHub.connect(user1).mint(metadataIndex, { value: mintingFee }))
        .to.emit(nftHub, "NFTMinted");

      expect(await nftHub.ownerOf(1)).to.equal(user1.address);
      expect(await nftHub.tokenURI(1)).to.equal(await nftHub.predefinedMetadataURIs(metadataIndex));
    });

    it("Should reject minting from unregistered user", async function () {
      const mintingFee = await nftHub.mintingFee();

      await expect(nftHub.connect(user2).mint(0, { value: mintingFee }))
        .to.be.revertedWith("User must be registered");
    });

    it("Should reject minting with insufficient fee", async function () {
      const insufficientFee = ethers.parseEther("0.001");

      await expect(nftHub.connect(user1).mint(0, { value: insufficientFee }))
        .to.be.revertedWith("Insufficient minting fee");
    });

    it("Should reject minting with invalid metadata index", async function () {
      const mintingFee = await nftHub.mintingFee();

      await expect(nftHub.connect(user1).mint(10, { value: mintingFee }))
        .to.be.revertedWith("Invalid metadata index");
    });

    it("Should increment token IDs correctly", async function () {
      const mintingFee = await nftHub.mintingFee();

      await nftHub.connect(user1).mint(0, { value: mintingFee });
      await nftHub.connect(user1).mint(1, { value: mintingFee });

      expect(await nftHub.nextTokenId()).to.equal(3);
      expect(await nftHub.getTotalSupply()).to.equal(2);
    });

    it("Should refund excess payment", async function () {
      const mintingFee = await nftHub.mintingFee();
      const excessAmount = mintingFee + ethers.parseEther("0.01");

      const initialBalance = await ethers.provider.getBalance(user1.address);
      const tx = await nftHub.connect(user1).mint(0, { value: excessAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(user1.address);
      const expectedBalance = initialBalance - mintingFee - gasUsed;

      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });
  });

  describe("Blacklist Management", function () {
    it("Should allow owner to add user to blacklist", async function () {
      await expect(nftHub.addToBlacklist(user1.address))
        .to.emit(nftHub, "UserBlacklisted");

      expect(await nftHub.isBlacklisted(user1.address)).to.be.true;
    });

    it("Should allow owner to remove user from blacklist", async function () {
      await nftHub.addToBlacklist(user1.address);

      await expect(nftHub.removeFromBlacklist(user1.address))
        .to.emit(nftHub, "UserRemovedFromBlacklist");

      expect(await nftHub.isBlacklisted(user1.address)).to.be.false;
    });

    it("Should reject adding already blacklisted user", async function () {
      await nftHub.addToBlacklist(user1.address);

      await expect(nftHub.addToBlacklist(user1.address))
        .to.be.revertedWith("User already blacklisted");
    });

    it("Should reject removing non-blacklisted user", async function () {
      await expect(nftHub.removeFromBlacklist(user1.address))
        .to.be.revertedWith("User not blacklisted");
    });

    it("Should reject blacklist operations from non-owner", async function () {
      await expect(nftHub.connect(user1).addToBlacklist(user2.address))
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");

      await expect(nftHub.connect(user1).removeFromBlacklist(user2.address))
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");
    });
  });

  describe("Fee Management", function () {
    it("Should allow owner to update fees", async function () {
      const newRegistrationFee = ethers.parseEther("0.02");
      const newMintingFee = ethers.parseEther("0.01");

      await expect(nftHub.setFees(newRegistrationFee, newMintingFee))
        .to.emit(nftHub, "FeesUpdated");

    });

    it("Should reject fee updates from non-owner", async function () {
      await expect(nftHub.connect(user1).setFees(ethers.parseEther("0.02"), ethers.parseEther("0.01")))
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");
    });
  });

  describe("Metadata Management", function () {
    it("Should allow owner to update metadata URI", async function () {
      const newURI = "ipfs://QmNewHash/metadata.json";

      await nftHub.updateMetadataURI(0, newURI);
      expect(await nftHub.predefinedMetadataURIs(0)).to.equal(newURI);
    });

    it("Should reject invalid metadata index", async function () {
      await expect(nftHub.updateMetadataURI(10, "ipfs://QmNewHash/metadata.json"))
        .to.be.revertedWith("Invalid index");
    });

    it("Should reject metadata updates from non-owner", async function () {
      await expect(nftHub.connect(user1).updateMetadataURI(0, "ipfs://QmNewHash/metadata.json"))
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to add new metadata URI when below limit", async function () {
      await nftHub.removeMetadataURI(0);
      const initialCount = (await nftHub.getPredefinedMetadataURIs()).length;

      const newURI = "ipfs://QmNewHash/metadata.json";
      await nftHub.addMetadataURI(newURI);

      const uris = await nftHub.getPredefinedMetadataURIs();
      expect(uris.length).to.equal(initialCount + 1);
      expect(uris[uris.length - 1]).to.equal(newURI);
    });

    it("Should reject adding empty metadata URI", async function () {
      await expect(nftHub.addMetadataURI(""))
        .to.be.revertedWith("Empty URI not allowed");
    });

    it("Should allow owner to remove metadata URI", async function () {
      const initialCount = (await nftHub.getPredefinedMetadataURIs()).length;

      await nftHub.removeMetadataURI(0);
      const uris = await nftHub.getPredefinedMetadataURIs();
      expect(uris.length).to.equal(initialCount - 1);
    });

    it("Should reject removing last metadata URI", async function () {
      for (let i = 8; i >= 0; i--) {
        await nftHub.removeMetadataURI(i);
      }

      await expect(nftHub.removeMetadataURI(0))
        .to.be.revertedWith("Cannot remove last URI");
    });

    it("Should reject adding metadata URI when at maximum limit", async function () {
      const maxURIs = await nftHub.MAX_METADATA_URIS();
      const currentURIs = await nftHub.getPredefinedMetadataURIs();

      // Ensure we're at the maximum limit
      expect(currentURIs.length).to.equal(maxURIs);

      await expect(nftHub.addMetadataURI("ipfs://QmTest/metadata.json"))
        .to.be.revertedWith("Maximum URIs limit reached");
    });
  });

  describe("Withdrawal", function () {
    beforeEach(async function () {
      const registrationFee = await nftHub.registrationFee();
      const mintingFee = await nftHub.mintingFee();

      await nftHub.connect(user1).register({ value: registrationFee });
      await nftHub.connect(user1).mint(0, { value: mintingFee });
    });

    it("Should allow owner to withdraw funds", async function () {
      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await nftHub.getAddress());

      const tx = await nftHub.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const expectedBalance = initialOwnerBalance + contractBalance - gasUsed;

      expect(finalOwnerBalance).to.be.closeTo(expectedBalance, ethers.parseEther("0.001"));
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(nftHub.connect(user1).withdraw())
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausable", function () {
    it("Should allow owner to pause and unpause", async function () {
      await nftHub.pause();

      const registrationFee = await nftHub.registrationFee();
      await expect(nftHub.connect(user1).register({ value: registrationFee }))
        .to.be.revertedWithCustomError(nftHub, "EnforcedPause");

      await nftHub.unpause();

      await expect(nftHub.connect(user1).register({ value: registrationFee }))
        .to.emit(nftHub, "UserRegistered");
    });

    it("Should reject pause/unpause from non-owner", async function () {
      await expect(nftHub.connect(user1).pause())
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");

      await expect(nftHub.connect(user1).unpause())
        .to.be.revertedWithCustomError(nftHub, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    it("Should return predefined metadata URIs array", async function () {
      const uris = await nftHub.getPredefinedMetadataURIs();
      const maxURIs = await nftHub.MAX_METADATA_URIS();

      expect(uris.length).to.equal(maxURIs);
      expect(uris[0]).to.include("ipfs://");
    });

    it("Should return correct registration and blacklist status", async function () {
      expect(await nftHub.isRegistered(user1.address)).to.be.false;
      expect(await nftHub.isBlacklisted(user1.address)).to.be.false;

      const registrationFee = await nftHub.registrationFee();
      await nftHub.connect(user1).register({ value: registrationFee });
      await nftHub.addToBlacklist(user1.address);

      expect(await nftHub.isRegistered(user1.address)).to.be.true;
      expect(await nftHub.isBlacklisted(user1.address)).to.be.true;
    });
  });
});