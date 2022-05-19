// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  const [deployer] = await ethers.getSigners();
  console.log("Deploying the contracts with the account:", deployer.address);
  
  // We get the contract to deploy
  const Membership = await ethers.getContractFactory("Membership");
  const membership = await Membership.deploy();

  await membership.deployed();

  console.log("Membership Contract deployed to:", membership.address);

  // We get the contract to deploy
  const Board = await ethers.getContractFactory("Board");
  const board = await Board.deploy();

  await board.deployed();

  console.log("Board Contract deployed to:", board.address);
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
