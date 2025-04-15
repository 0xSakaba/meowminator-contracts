import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Signer } from "ethers";
import { MeowminatorNFT } from "../typechain-types";
import { mine, time } from "@nomicfoundation/hardhat-network-helpers";

describe("MeowminatorNFT", function () {
  let MeowminatorNFT: MeowminatorNFT;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await hre.ethers.getSigners();
    const MeowminatorNFTFactory = await hre.ethers.getContractFactory(
      "MeowminatorNFT"
    );
    MeowminatorNFT = await MeowminatorNFTFactory.deploy(
      new Date("2025-04-15 05:00:00").getTime() / 1000,
      new Date("2025-05-15 05:00:00").getTime() / 1000,
      "https://example.com/"
    );
  });

  it("Should deploy the contract", async function () {
    expect(await MeowminatorNFT.name()).to.equal("Meowminator from Superboard");
    expect(await MeowminatorNFT.symbol()).to.equal("MEOW");
  });

  it("Should not mint NFTs before the sale period", async function () {
    await expect(
      MeowminatorNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0007"),
      })
    ).to.be.revertedWith("Sale has not started");
  });

  it("Should mint 1 NFT within the sale period", async function () {
    await time.increaseTo(new Date("2025-04-15 05:00:00").getTime() / 1000);
    await MeowminatorNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.0007"),
    });
    expect(await MeowminatorNFT.totalSupply()).to.equal(1);

    expect(
      MeowminatorNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0007"),
      })
    ).to.be.revertedWith("Already minted");
  });

  it("Should not mint NFTs with insufficient ETH", async function () {
    await expect(
      MeowminatorNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0006999"),
      })
    ).to.be.revertedWith("Insufficient ETH sent");
  });

  it("Should allow the owner to set the base URI", async function () {
    await MeowminatorNFT.connect(owner).setBaseURI("https://newexample.com/");

    await MeowminatorNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.0007"),
    });
    expect(await MeowminatorNFT.tokenURI(1)).to.equal(
      "https://newexample.com/"
    );
  });

  it("Should allow the owner to withdraw the contract balance", async function () {
    await MeowminatorNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.0007"),
    });
    const initialBalance = await hre.ethers.provider.getBalance(
      await owner.getAddress()
    );
    await MeowminatorNFT.connect(owner).withdraw();
    const finalBalance = await hre.ethers.provider.getBalance(
      await owner.getAddress()
    );
    expect(finalBalance).to.be.above(initialBalance);
  });

  it("Should not mint NFTs after the sale period", async function () {
    // const block = await hre.ethers.provider.getBlock("latest");
    // console.log("Block timestamp:", block?.timestamp);

    await time.increaseTo(new Date("2025-05-15 05:00:00").getTime() / 1000);

    await expect(
      MeowminatorNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0007"),
      })
    ).to.be.revertedWith("Sale has ended");
  });

  it("Should can continue minting once new sale period starts", async function () {
    const newSaleStart = new Date("2025-06-15 05:00:00").getTime() / 1000;
    const newSaleEnd = new Date("2025-07-15 05:00:00").getTime() / 1000;
    await MeowminatorNFT.connect(owner).setStartAndEndTimestamp(
      newSaleStart,
      newSaleEnd
    );

    await time.increaseTo(new Date("2025-06-15 05:00:00").getTime() / 1000);
    await MeowminatorNFT.connect(addr1).mint(1, {
      value: hre.ethers.parseEther("0.0007"),
    });
    expect(await MeowminatorNFT.totalSupply()).to.equal(1);

    await time.increaseTo(new Date("2025-07-15 05:00:00").getTime() / 1000);
    await expect(
      MeowminatorNFT.connect(addr1).mint(1, {
        value: hre.ethers.parseEther("0.0007"),
      })
    ).to.be.revertedWith("Sale has ended");
  });
});
