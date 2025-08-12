import hre from "hardhat";
const { ethers } = hre;

export const MINTING_FEE = ethers.parseEther("0.002");
export const REGISTRATION_FEE = ethers.parseEther("0.0001");