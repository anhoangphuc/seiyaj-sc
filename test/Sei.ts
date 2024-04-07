import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { WeiPerEther } from "ethers";
import { Seiyaj } from "../typechain-types";

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
});
