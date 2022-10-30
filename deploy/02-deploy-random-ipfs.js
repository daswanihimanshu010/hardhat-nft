const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeMetadata } = require("../utils/uploadToPinata");
require("dotenv").config();

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Speed",
      value: 100,
    },
  ],
};

let tokenURIs = [
  "ipfs://Qmf7avfX6v7BDoR6bXjJATa4QGA84cCjrsHeLaf78uooL6",
  "ipfs://QmcnPyRHUpt2Yk1aHmcKy3NY6gC5bG4FaEtmPVmXFYEczQ",
  "ipfs://QmY4DoFCY5axdktSey59hVtLnVxaDqCv2y1M8JLxucXuHV",
];

const FUND_AMOUNT = "1000000000000000000000"; // 10 LINKS

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (process.env.UPLOAD_TO_PINATA == "false") {
    // This fn will upload our images to pinata
    tokenURIs = await handleTokenUri();
  }

  let coordinatorV2Mock, coordinatorV2MockAddress, subscriptionId;

  if (developmentChains.includes(network.name)) {
    coordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    coordinatorV2MockAddress = coordinatorV2Mock.address;
    const tx = await coordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await coordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    coordinatorV2MockAddress = networkConfig[chainId].vrfV2Coordinator;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("--------------------");

  const args = [
    coordinatorV2MockAddress,
    subscriptionId,
    networkConfig[chainId].keyHash,
    networkConfig[chainId].callbackGasLimit,
    tokenURIs,
    networkConfig[chainId].mintFee,
  ];

  const randomIpfsNft = await deploy("RandomIPFSNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log("---------------------");

  if (developmentChains.includes(network.name)) {
    await coordinatorV2Mock.addConsumer(subscriptionId, randomIpfsNft.address);

    log("Consumer is added");
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHER_SCAN_API_KEY
  ) {
    await verify(randomIpfsNft.address, args);
  }

  log("RandomIPFSNFT contract deployed!");
};

async function handleTokenUri() {
  tokenURIs = [];
  // store image in ipfs
  // store metadata in ipfs

  // responses: imageUploadResponses means that we are going to access responses with the name of
  // imageUploadResponses

  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );

  // imageUploadResponses has the hash of the image CID that we need to pass in the metadata template
  for (imageResponseIndex in imageUploadResponses) {
    //create metadata
    //upload metadata

    // javascript magic that means we are unpacking all of json present in metadataTemplate
    // into tokenUriMetaData
    let tokenUriMetaData = { ...metadataTemplate };
    tokenUriMetaData.name = files[imageResponseIndex].replace(".png", "");
    tokenUriMetaData.description = `Octopus named ${tokenUriMetaData.name}`;

    // See docs of pinata
    tokenUriMetaData.image = `ipfs://${imageUploadResponses[imageResponseIndex].IpfsHash}`;
    console.log(`Uploading ${tokenUriMetaData.name}...`);

    // Now we want to upload our metadata to pinata to get ipfs url pointing at metadata which
    // is pointing to the image

    const metaDataResponse = await storeMetadata(tokenUriMetaData);
    tokenURIs.push(`ipfs://${metaDataResponse.IpfsHash}`);
  }

  console.log("Token URIs Uploaded! They are:");
  console.log(tokenURIs);

  return tokenURIs;
}

module.exports.tags = ["all", "randomIpfs", "main"];
