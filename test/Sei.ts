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
    const [admin] = await ethers.getSigners();
    const SeiContract = await ethers.getContractFactory("Seiyaj");
    const seiyaj = (await SeiContract.deploy()) as Seiyaj;

    return { seiyaj, admin };
  }

  describe("Deployment", function () {
    it("Should deploy success", async function () {
      const { seiyaj, admin } = await loadFixture(deploy);

      expect(await seiyaj.getAddress()).to.be.properAddress;
      expect(await seiyaj.cap()).to.be.eq(BigInt(1000000000) * WeiPerEther);
      expect(await seiyaj.admin()).to.be.eq(admin.address);
    });
  });
});
