3 contracts

`1. Basic NFT (Basic ERC 721 token)`

`yarn add --dev @openzeppelin/contracts`

-> Using Openzeppelin: https://docs.openzeppelin.com/contracts/4.x/erc721

-> /home/daswanihimanshu010/hh-fcc/hardhat-nft/node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol

-> Inheriting and using ERC721 in constructor.

-> To mint using ERC721 w use `_safeMint()` function.

-> Now how will a NFT look like and where is its meta data. For that ERC721 has `tokenURI()` function.

-> Using an image hosted on IPFS is necessary because we have to keep our image on decentralized storage because if centralized storage goes down our image goes down with it. Try to use url starting with `ipfs://`. Visit the url in brave browser to see how an NFT token URI looks like with image, name, description and attributes. Don't use like this `https://ipfs.io/ipfs/tokenuri`, use it like `ipfs://tokenuri`.

`2. Random IPFS NFT`

I) To get a random NFT for a user we need to generate a random number:

-> Because we will be working with generate Random number Chainlink VRF: https://docs.chain.link/docs/vrf/v2/subscription/examples/get-a-random-number/ we have to add `yarn add @chainlink/contracts`.

---

II) Assigning that random NFT to the user who requested for NFT:

`Thing to Note:`

-> Now the request of random word is being handled in two parts, where one user requests for a random word in `requestNFT()` and later we are going to fulfill the request by providing a random number in `fulfillRandomWords()`.

-> We want that whoever calls the `requestNFT()` function NFT should be assigned to that `msg.sender`. But the `fulfillRandomWords()` function is being called by chainlink node so `msg.sender` in that case will be the chainlink oracle.

-> So if we do `_safeMint(msg.sender, s_tokenCounter)` in `fulfillRandomWords()` then the owner of NFT will become chainlink oracle which we do not want.

-> So what we need to do is create a `mapping` between `requestId` and `msg.sender` so whenever we call `fulfillRandomWords(uint256 requestId)` we can track which `msg.sender` is the owner of the NFT through `requestId`.

---

III) Assign a rarity type of NFT:

-> Now we minted NFT and assigned owner, now we have to give a dog breed (rarity of NFT). Checkout `getRarityFromRandomNumber()` function in `RandomIPFSNFT.sol`.

IV) Assigning NFT Image:

-> After setting rarity, it is time to set NFT image. For that we can use `_setTokenURI()` function in `openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol`.

-> `ERC721URIStorage.sol` extends `ERC721` so we don't need to change constructor just change the imports to use `_setTokenURI(uint256 tokenId, string memory _tokenURI)` function.

V) Setting NFT Price & Withdrawing amount by owner:

-> Quite starightforward, just make our `requestNft()` function as payable.

-> We can use `openzeppelin-contracts/contracts/access/Ownable.sol` for `onlyOwner` modifier for withdraw function.

VI) Uploading our images on IPFS or on a decntralized platform for our deploy script.

-> There are 3 ways to host your image and pin them at multiple nodes so they always remains up if even our node goes down and it remains decentralized:

a. With our own IPFS node. https://docs.ipfs.tech/ (Putting up your data on your node)
b. Pinata. https://www.pinata.cloud/ (Ideally atleast one person pinning your data)
c. NFT Storage. https://nft.storage/ (Whole a whole decentralized network pinning your data, most persistant)

-> Using Pinata: We are asking pinata to pin our data in case if our node goes down and images remain accessible in a decentralized form.

`How to upload image and metadata in pinata?`

We are going to upload all images in images/randomNft folder.

a. Register in pinata get api and secret key and add it to .env

b. Add pinata sdk from docs: https://www.npmjs.com/package/@pinata/sdk. `yarn add --dev @pinata/sdk`

c. In docs pinning image in pinata can be done by `pinFileToIPFS` pin and pinning metadata can be done by `pinJSONToIPFS`. See in docs for implementation.

d. We are going to use path so add path package also: `yarn add --dev path`.

e. Before calling `pinFileToIPFS` or `pinJSONToIPFS` we need to pass api key and secret to pinatsdk to start pinning data.

`To pin on your node:`

a. After your images have been uploaded you can pin your images using their CID found in pinata in IPFS local node in your pc using import from IPFS and importing via CID.

b. If you are not able to import or access your IPFS url in your local IPFS node or brave browser try to visit that image using `https://ipfs.io/ipfs/CID` once.

`Now to upload your metadata to pinata:`

a. First we have to create a template for metadata.

b. We fill in the name and description with dynamic values and for image we extract `IpfsHash` from the imageResponses we got by pinning our image to pinata and we loop through the imageResponses and upload the metadata to pinata.

`3. Dynamic SVG NFT`

-> We are taking `lowSvg` and `highSvg` to show `lowSvg` if price feed from chainlink is lower than specific amount and vice versa.

-> We have to convert these Svg avaliable in `<svg width="500" height="500">` format into base64 encoding so these are avaliable on chain. So we use `yarn add base64-sol`.

-> The `_baseURI()` is overriden function of ERC721.sol

-> The `svgToImageURI()` fn converts svg to string base64 encoded url that can be uploaded on chain easiely. `abi.encodePacked` is a global fn can be used at various places like to convert the svg to 32 bytes, visit: `https://docs.soliditylang.org/en/v0.8.0/abi-spec.html#non-standard-packed-mode`. It can be used for string concat also: `string(abi.encodePacked(baseURL, svgBase64Encoded))`.

-> `tokenURI()` fn overriden from ERC721.sol class helps us submit metadata and we are going to submit the metadata in the encoded form of base64 as well.

-> `highValue` in `mintNft()` is the price that decides which svg to show, it is entered by user while minting the nft.

`Comparison between Dynamic SVG NFT && Random IPFS NFT`

1. Random IPFS NFT

-> Pros: Cheap
-> Cons: Someone needs to pin our data

2. Dynamic SVG NFT

-> Pros: The data is on chain! Pineed by many nodes
-> Cons: Expensive

`Deployed Goerli Contracts: yarn hardhat deploy --network goerli --tags main`

Basic NFT Contract Address: 0xFef2786bAe847904db831346E7f77BD0Bc000Ef5

Verification Result: https://goerli.etherscan.io/address/0xFef2786bAe847904db831346E7f77BD0Bc000Ef5#code

Random IPFS NFT Contract Address: 0x9ED7561C699385b3Ef93F4d3E54F39AbAb429FF3

Verification Result: https://goerli.etherscan.io/address/0x9ED7561C699385b3Ef93F4d3E54F39AbAb429FF3#code

DynamicSvgNFT: 0x7DB25852C19791fBED722F22462cBE3497344397

`After Deploying`

1. Add Consumer to subscription by going to `vrf.chain.link` for RandomIPFSNFT contract.

2. Click on Add consumer in subscription detail screen.

3. Copy the smart contract address of RandomIPFS NFT contract and add it as consumer.

4. Now we can run mint script by `yarn hardhat deploy --network goerli --tags mint`.
