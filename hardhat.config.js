require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-solhint");
require("hardhat-deploy");
require("dotenv").config();
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-etherscan");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_PRIVATE_KEY_ACCOUNT1 = process.env.GOERLI_PRIVATE_KEY_ACCOUNT1;
const ETHER_SCAN_API_KEY = process.env.ETHER_SCAN_API_KEY;
const COIN_MARKET_CAP = process.env.COIN_MARKET_CAP;
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  //solidity: "0.8.8",
  solidity: {
    compilers: [
      { version: "0.8.8" },
      { version: "0.6.6" },
      { version: "0.4.19" },
      { version: "0.6.12" },
      { version: "0.6.0" },
      { version: "0.8.4" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // for deployer the default will be 0th wallet address with private key
      //5: 1, // chainId, for chainId: 5 (goerli), the wallet address to be used is 1st wallet address
    },
    // user: {
    //   default: 0,
    // },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY_ACCOUNT1],
      chainId: 5,
      blockConfirmations: 6, // same like deployedContractObject.wait(6);
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts: hardhat gives 10 fake accounts already after running yarn hardhat node,
      chainId: 31337,
    },
  },
  defaultNetwork: "hardhat",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHER_SCAN_API_KEY,
  },
  gasReporter: {
    enabled: true, // set it to true to enable gas reporting
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD", // to bring the gas in USD
    coinmarketcap: COIN_MARKET_CAP, // to bring the gas in USD
    token: "ETH", // to get cost if we are deploying on a different network
  },
};
