// SPDX-License-Identifier: MIT
// NFTHub.sol
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract NFTHub is ERC721, Ownable, ReentrancyGuard, Pausable {
    uint256 public registrationFee = 0.001 ether;
    uint256 public mintingFee = 0.003 ether;
    uint256 public nextTokenId = 1;
    
    mapping(address => bool) public registeredUsers;
    mapping(address => bool) public blacklistedUsers;
    mapping(uint256 => string) public tokenURIs;
    
    string[10] public predefinedMetadataURIs = [
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq",
        "ipfs://bafkreigp5mvodmxpyjvo66xpzxs7d32kkc75x23j4zgrrlyglakpjdckiq"
    ];
    
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
    
    constructor() ERC721("NFTHub", "NFTH") Ownable(msg.sender) {}
    
    function register() external payable nonReentrant notBlacklisted whenNotPaused {
        require(!registeredUsers[msg.sender], "User already registered");
        require(msg.value >= registrationFee, "Insufficient registration fee");
        
        registeredUsers[msg.sender] = true;
        emit UserRegistered(msg.sender, block.timestamp);
        
        if (msg.value > registrationFee) {
            payable(msg.sender).transfer(msg.value - registrationFee);
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
            payable(msg.sender).transfer(msg.value - mintingFee);
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
        payable(owner()).transfer(balance);
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
    
    function getPredefinedMetadataURIs() external view returns (string[10] memory) {
        return predefinedMetadataURIs;
    }
    
    function _update(address to, uint256 tokenId, address auth) internal override whenNotPaused returns (address) {
        return super._update(to, tokenId, auth);
    }
}