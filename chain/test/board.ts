import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Board", function () {
  let board;
  let hardhatBoard: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    board = await ethers.getContractFactory("Board");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatBoard = await board.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatBoard.owner()).to.equal(owner.address);
    });
  });

  describe("Airdrop", function () {    
    it("Should airdrop a board NFT to addr1", async function () {
      await hardhatBoard.Airdrop(addr1.address, "NFT1URI");
    
      expect(await hardhatBoard.ownerOf(1)).to.equal(addr1.address);
      
    });

    it("Should bulkairdrop", async function () {
      await hardhatBoard.BulkAirdrop([addr1.address, addr2.address], ["NFT1URI", "NFT2URI"]);
    
      expect(await hardhatBoard.ownerOf(1)).to.equal(addr1.address);
      expect(await hardhatBoard.ownerOf(2)).to.equal(addr2.address);
    });
  });

  
});
