// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

pragma solidity ^0.8.8;

error RandomIPFSNFT__RangeOutOfBounds();
error RandomIPFSNFT__NotEnoughETHEntered();
error RandomIPFSNFT__TransferFailed();

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    // when we mint an NFT, we will trigger chainlink vrf to call get us a random number
    // using that number, we will get a random NFT
    // Pug, shiba inu, St. bernad
    // Pug is super rare
    // Shibu sort of rare
    // St. bernad is common

    // users have to pay to mint an NFT
    // the owner of the contract can  withdraw the ETH

    // Type Variables
    enum Breed {
        PUG,
        SHIBA_INU,
        St_BERNAD
    }

    // Chainlink Randomness VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // mintNFT variables
    mapping(uint256 => address) public s_requestIdToSender;
    uint256 private s_tokenCounter;

    // rarity NFT variables
    uint256 internal constant MAX_CHANCE_VALUE = 100;

    // NFT Images Variables
    string[] internal s_nftTokenURIs;
    uint256 internal immutable i_mintFee;

    // Events

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed nftBreed, address minter);

    constructor(
        address vrfCoordinatorAddress,
        uint64 subscriptionId,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        string[] memory nftTokenURIs,
        uint256 mintFee
    )
        VRFConsumerBaseV2(vrfCoordinatorAddress)
        ERC721("Random IPFS NFT", "RIN")
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        s_nftTokenURIs = nftTokenURIs;
        i_mintFee = mintFee;
    }

    function requestNFT() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIPFSNFT__NotEnoughETHEntered();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address nftOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        // 0 - 99
        // 7 -> PUG
        // 88 -> St. Bernad
        // 45 -> St. Bernad
        // 12 -> Shiba Inu
        Breed tokenRarity = getRarityFromRandomNumber(moddedRng);
        s_tokenCounter = s_tokenCounter + 1;
        // function of ERC71 contract that has been inherited above
        _safeMint(nftOwner, newTokenId);
        // getting numeric value of Breed enum uint256(tokenRarity)
        _setTokenURI(newTokenId, s_nftTokenURIs[uint256(tokenRarity)]);
        emit NftMinted(tokenRarity, nftOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIPFSNFT__TransferFailed();
        }
    }

    // Pure function disallows modification and reading of state/storage/variables in blockchain
    function getRarityFromRandomNumber(uint256 moddedRng)
        public
        pure
        returns (Breed)
    {
        uint256 cummulativeSum = 0;
        // moddedRng = 25
        // we want to save this chanceArray in memory not in storage, as it is just to be used
        // for this loop only
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (
                moddedRng >= cummulativeSum &&
                moddedRng < cummulativeSum + chanceArray[i]
            ) {
                return Breed(i);
            }
            cummulativeSum += chanceArray[i];
        }
        revert RandomIPFSNFT__RangeOutOfBounds();
    }

    // returns 3 uint256 values in memory
    // index 0 has 10% of chance
    // index 1 has 20% of chance (30-10)
    // index 2 has 60% of chance (100-10-30)
    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    // Getters

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getTokenUri(uint256 index) public view returns (string memory) {
        return s_nftTokenURIs[index];
    }
}
