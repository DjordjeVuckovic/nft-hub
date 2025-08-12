// SPDX-License-Identifier: APACHE-2.0
// NFTHub.sol
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTHub is ERC721, Ownable, ReentrancyGuard, Pausable {
    uint256 public registrationFee;
    uint256 public mintingFee;
    uint256 public nextTokenId = 1;
    uint8 public constant MAX_METADATA_URIS = 10;
    
    mapping(address => bool) public registeredUsers;
    mapping(address => bool) public blacklistedUsers;
    mapping(uint256 => string) public tokenURIs;
    
    string[] public predefinedMetadataURIs;
    
    event UserRegistered(address indexed user, uint256 timestamp);
    event NFTMinted(address indexed to, uint256 indexed tokenId, string metadataURI, uint256 timestamp);
    event UserBlacklisted(address indexed user, uint256 timestamp);
    event UserRemovedFromBlacklist(address indexed user, uint256 timestamp);
    event FeesUpdated(uint256 registrationFee, uint256 mintingFee, uint256 timestamp);
    
    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User must be registered");
        _;
    }
    
    modifier notBlacklisted() {
        require(!blacklistedUsers[msg.sender], "User is blacklisted");
        _;
    }
    
    /**
     * @dev Initializes the contract by setting the registration and minting fees and setting up predefined metadata URIs.
     * @param _registrationFee Initial registration fee in wei
     * @param _mintingFee Initial minting fee in wei
     * @param _metadataURIs Array of IPFS URIs for predefined metadata (max 10)
     */
    constructor(
        uint256 _registrationFee,
        uint256 _mintingFee,
        string[] memory _metadataURIs
    ) ERC721("NftHubCollection", "NftHub") Ownable(msg.sender) {
        require(_registrationFee > 0, "Registration fee must be greater than 0");
        require(_mintingFee > 0, "Minting fee must be greater than 0");
        require(_metadataURIs.length > 0 && _metadataURIs.length <= MAX_METADATA_URIS, "Invalid metadata URIs count");
        
        registrationFee = _registrationFee;
        mintingFee = _mintingFee;
        
        for (uint8 i = 0; i < _metadataURIs.length; i++) {
            require(bytes(_metadataURIs[i]).length > 0, "Empty metadata URI not allowed");
            predefinedMetadataURIs.push(_metadataURIs[i]);
        }
    }
    
    function register() external payable nonReentrant notBlacklisted whenNotPaused {
        require(!registeredUsers[msg.sender], "User already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender, block.timestamp);
        
        if (msg.value > registrationFee) {
            uint256 refund = msg.value - registrationFee;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
    }
    
    function mint(uint256 metadataIndex) external payable nonReentrant onlyRegistered notBlacklisted {
        require(msg.value >= mintingFee, "Insufficient minting fee");
        require(metadataIndex < predefinedMetadataURIs.length, "Invalid metadata index");
        
        uint256 tokenId = nextTokenId;
        nextTokenId++;
        
        tokenURIs[tokenId] = predefinedMetadataURIs[metadataIndex];
        _safeMint(msg.sender, tokenId);
        
        emit NFTMinted(msg.sender, tokenId, tokenURIs[tokenId], block.timestamp);
        
        if (msg.value > mintingFee) {
            uint256 refund = msg.value - mintingFee;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
    }
    
    function addToBlacklist(address user) external onlyOwner {
        require(!blacklistedUsers[user], "User already blacklisted");
        blacklistedUsers[user] = true;
        emit UserBlacklisted(user, block.timestamp);
    }
    
    function removeFromBlacklist(address user) external onlyOwner {
        require(blacklistedUsers[user], "User not blacklisted");
        blacklistedUsers[user] = false;
        emit UserRemovedFromBlacklist(user, block.timestamp);
    }
    
    function setFees(uint256 _registrationFee, uint256 _mintingFee) external onlyOwner {
        registrationFee = _registrationFee;
        mintingFee = _mintingFee;
        emit FeesUpdated(_registrationFee, _mintingFee, block.timestamp);
    }
    
    function updateMetadataURI(uint256 index, string calldata newURI) external onlyOwner {
        require(index < predefinedMetadataURIs.length, "Invalid index");
        predefinedMetadataURIs[index] = newURI;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenURIs[tokenId];
    }
    
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function getTotalSupply() external view returns (uint256) {
        return nextTokenId - 1;
    }
    
    function isRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }
    
    function isBlacklisted(address user) external view returns (bool) {
        return blacklistedUsers[user];
    }
    
    function getPredefinedMetadataURIs() external view returns (string[] memory) {
        return predefinedMetadataURIs;
    }
    
    function addMetadataURI(string calldata newURI) external onlyOwner {
        require(bytes(newURI).length > 0, "Empty URI not allowed");
        require(predefinedMetadataURIs.length < MAX_METADATA_URIS, "Maximum URIs limit reached");
        predefinedMetadataURIs.push(newURI);
    }
    
    function removeMetadataURI(uint256 index) external onlyOwner {
        require(index < predefinedMetadataURIs.length, "Invalid index");
        require(predefinedMetadataURIs.length > 1, "Cannot remove last URI");
        
        predefinedMetadataURIs[index] = predefinedMetadataURIs[predefinedMetadataURIs.length - 1];
        predefinedMetadataURIs.pop();
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
}