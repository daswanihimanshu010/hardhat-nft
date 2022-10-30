const networkConfig = {
  // whatever networks you are defining here, should also be present in hardhat.config.js, network tab
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    vrfV2Coordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    subscriptionId: "1448",
    mintFee: "10000000000000000", // 0.01 ETH
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
    callbackGasLimit: "500000", // 500,000 gas
  },
  31337: {
    name: "hardhat",
    mintFee: "10000000000000000", // 0.01 ETH
    keyHash:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
    callbackGasLimit: "500000", // 500,000 gas
  },
};

const DECIMALS = 8;

const developmentChains = ["hardhat", "localhost"];

module.exports = { networkConfig, developmentChains, DECIMALS };
