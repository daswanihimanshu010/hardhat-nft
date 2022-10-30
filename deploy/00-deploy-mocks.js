const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

// Go to https://docs.chain.link/docs/vrf/v2/direct-funding/supported-networks/#goerli-testnet
// You can see Premium:	0.25 LINK
// This means to call vrfCoordinatorv2 it is going to cost 0.25 LINK
// LINK is we can call as oracle gas.

const BASE_FEE = ethers.utils.parseEther("0.25");

// Chainlink nodes pay gas fees to give us randomness & do external execution
// So the price of these requests changes based on price of gas
const GAS_PRICE_LINK = 1e9; // 1000000000; // link per gas

const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("2000", "ether");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("Deploying a mock for vrfCoordinatorV2...");

    const mockRaffleContract = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: args,
      log: true,
    });

    const mockPriceFeedContract = await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, INITIAL_PRICE],
      log: true,
    });

    log("Mocks Deployed!!");
    log("--------------------------------------");
  }
};

module.exports.tags = ["all", "mocks", "main"];
