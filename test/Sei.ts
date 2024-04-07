import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { WeiPerEther, ZeroAddress } from "ethers";
import { Seiyaj } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("Sei", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    const [admin, user1] = await ethers.getSigners();
    const SeiContract = await ethers.getContractFactory("Seiyaj");
    const seiyaj = (await SeiContract.deploy()) as Seiyaj;

    return { seiyaj, admin, user1 };
  }

  describe("Deployment", function () {
    it("Should deploy success", async function () {
      const { seiyaj, admin } = await loadFixture(deploy);

      expect(await seiyaj.getAddress()).to.be.properAddress;
      expect(await seiyaj.cap()).to.be.eq(BigInt(1000000000) * WeiPerEther);
      expect(await seiyaj.admin()).to.be.eq(admin.address);
    });
  });

  describe("Admin function", function () {
    it("Should set new admin success", async function () {
      const { seiyaj, admin, user1 } = await loadFixture(deploy);
      await seiyaj.connect(admin).transferAdminOwnership(user1.address);
      expect(await seiyaj.admin()).to.be.eq(user1.address);
    });

    it("Should set admin failure Only Admin", async function () {
      const { seiyaj, admin, user1 } = await loadFixture(deploy);
      await expect(
        seiyaj.connect(user1).transferAdminOwnership(user1.address),
      ).to.be.revertedWith("Only Admin");
    });

    it("Set whitelist success", async function () {
      const { seiyaj, admin, user1 } = await loadFixture(deploy);
      const amount = BigInt(5) * WeiPerEther;
      await expect(seiyaj.connect(admin).setWhitelist(user1.address, amount))
        .to.be.emit(seiyaj, "WhitelistSet")
        .withArgs(user1.address, amount);
      expect(await seiyaj.whitelist(user1.address)).to.be.eq(amount);

      const amount2 = BigInt(10) * WeiPerEther;
      await expect(seiyaj.connect(admin).setWhitelist(user1.address, amount2))
        .to.be.emit(seiyaj, "WhitelistSet")
        .withArgs(user1.address, amount + amount2);
      expect(await seiyaj.whitelist(user1.address)).to.be.eq(amount + amount2);
    });
  });

  describe("User function", function () {
    let amount: bigint;
    let seiyaj: Seiyaj;
    let user1: HardhatEthersSigner;
    beforeEach(async () => {
      amount = BigInt(10) * WeiPerEther;
      ({ seiyaj, user1 } = await loadFixture(deploy));
      await seiyaj.setWhitelist(user1.address, amount);
    });

    it("Should faucet success", async function () {
      await expect(seiyaj.connect(user1).faucet(amount))
        .to.be.emit(seiyaj, "Faucet")
        .withArgs(user1.address, amount)
        .to.be.emit(seiyaj, "Transfer")
        .withArgs(ZeroAddress, user1.address, amount);
    });

    it("Should faucet failure exceed", async function () {
      await seiyaj.connect(user1).faucet(amount / BigInt(2));
      await expect(
        seiyaj.connect(user1).faucet(amount / BigInt(2) + BigInt(1)),
      ).to.be.rejectedWith("Exceed");
    });

    it("Should send multiple users success", async function () {
      await seiyaj.connect(user1).faucet(amount);
      const [user2, user3] = [
        ethers.Wallet.createRandom(),
        ethers.Wallet.createRandom(),
      ];
      const amount2 = (amount * BigInt(4)) / BigInt(6);
      const amount3 = amount - amount2;

      await expect(
        seiyaj
          .connect(user1)
          .sendMultipleRecipient(
            [user2.address, user3.address],
            [amount2, amount3],
          ),
      )
        .to.be.emit(seiyaj, "Transfer")
        .withArgs(user1.address, user2.address, amount2)
        .to.be.emit(seiyaj, "Transfer")
        .withArgs(user1.address, user3.address, amount3);
    });

    it("Should send multiple users failure Invalid length ", async function () {
      const [user2, user3] = [
        ethers.Wallet.createRandom(),
        ethers.Wallet.createRandom(),
      ];

      await expect(
        seiyaj
          .connect(user1)
          .sendMultipleRecipient([user2.address, user3.address], [BigInt(1)]),
      ).to.be.revertedWith("Invalid length");
    });

    it("Should send multiple users failure Insufficient balance", async function () {
      const [user2, user3] = [
        ethers.Wallet.createRandom(),
        ethers.Wallet.createRandom(),
      ];

      const amount2 = (amount * BigInt(4)) / BigInt(6);
      const amount3 = amount - amount2;

      await expect(
        seiyaj
          .connect(user1)
          .sendMultipleRecipient(
            [user2.address, user3.address],
            [amount2, amount3 + BigInt(1)],
          ),
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
