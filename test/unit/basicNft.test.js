const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft", function () {
      beforeEach(async () => {
        await deployments.fixture(["all"]);

        ethers.getContract("Basic");
      });
    });
