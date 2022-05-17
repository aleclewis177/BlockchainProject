import { Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Membership", function () {
  let membership;
  let hardhatMembership: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    membership = await ethers.getContractFactory("Membership");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatMembership = await membership.deploy();
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
      expect(await hardhatMembership.owner()).to.equal(owner.address);
    });
  });

  describe("Mint", function () {    
    it("Should mint a Membership NFT to addr1 and transfer to addr2", async function () {
      await hardhatMembership.safeMint(addr1.address, "NFT1URI");
    
      expect(await hardhatMembership.ownerOf(1)).to.equal(addr1.address);      

      await hardhatMembership.connect(addr1).safeTransfer(addr2.address, 1);
      expect(await hardhatMembership.ownerOf(1)).to.equal(addr2.address);      
    });

    it("Should not mint 2+ Membership NFT to addr1", async function () {
      await hardhatMembership.safeMint(addr1.address, "NFT1URI");
    
      expect(await hardhatMembership.ownerOf(1)).to.equal(addr1.address);      

      await expect(
        hardhatMembership.safeMint(addr1.address, "NFT2URI")
      ).to.be.revertedWith("Membership::have membership.");      
    });
  });

  describe("Membership", function () {    
    it("Should have a membership after mint", async function () {
      
      expect(await hardhatMembership.connect(addr1).getMembership()).to.equal(false);
      await hardhatMembership.safeMint(addr1.address, "NFT1URI");
    
      expect(await hardhatMembership.connect(addr1).getMembership()).to.equal(true);
      
      await hardhatMembership.connect(addr1).safeTransfer(addr2.address, 1);
      expect(await hardhatMembership.connect(addr1).getMembership()).to.equal(false);
      expect(await hardhatMembership.connect(addr2).getMembership()).to.equal(true);
    });
  });
});
