const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  // basic nft
  const basicNftContract = await ethers.getContract("BasicNFT", deployer);

  const basicNftTx = await basicNftContract.mintNFT();
  await basicNftTx.wait(1);

  // console.log(
  //   `Basic NFT index 0 has tokenURI: ${await basicNftContract.tokenURI(0)}`
  // );

  // random nft ipfs

  const randomIpfsContract = await ethers.getContract(
    "RandomIPFSNFT",
    deployer
  );

  const mintFee = await randomIpfsContract.getMintFee();

  // We will have to wait for fulfillRandomWords to be called on a real testnet.
  // And we don't know when the event NftMinted will be called on a real testnet.
  // And when we are waiting for an event to happen or a function to be called, we need to setup
  // a Promise

  // That is why randomIpfsContract.requestNFT() is called inside promise but outside the listener:
  // randomIpfsContract.once

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 600000); // 10 minutes

    randomIpfsContract.once("NftMinted", async function () {
      resolve();
    });

    const randomIpfsNftTx = await randomIpfsContract.requestNFT({
      value: mintFee.toString(),
    });

    const randomIpfsNftTxReceipt = await randomIpfsNftTx.wait(1);
    if (developmentChains.includes(network.name)) {
      // Then we have to call fulfillrandomWords manually because we are not on real test net

      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );

      // To call vrfCoordinatorV2Mock.fulfillRandomWords we need requestId and owner address which
      // here is the contract address

      const requestId =
        randomIpfsNftTxReceipt.events[1].args.requestId.toString();

      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsContract.address
      );
    }
  });

  // console.log(
  //   `Random IPFS NFT index 0 tokenURI: ${await randomIpfsContract.tokenURI(0)}`
  // );

  // dynamic svg nft

  const highValue = ethers.utils.parseEther("4000");

  const dynamicSvgNftContract = await ethers.getContract(
    "DynamicSvgNFT",
    deployer
  );

  const dynamicSvgNftContractMint = await dynamicSvgNftContract.mintNft(
    highValue.toString()
  );

  await dynamicSvgNftContractMint.wait(1);

  // console.log(
  //   `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNftContract.tokenURI(
  //     0
  //   )}`
  // );
};

module.exports.tags = ["all", "mint"];
