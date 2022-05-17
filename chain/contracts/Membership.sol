//SPDX-License-Identifier: Unlicense
pragma solidity =0.8.1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Membership is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) private _isMember;
    constructor() ERC721("Membership", "MS") {
        
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        require(_isMember[to] != true, "Membership::have membership.");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        _isMember[to] = true;
    }

    function safeTransfer(address to, uint256 tokenId) public {
        safeTransferFrom(msg.sender, to, tokenId);
    }

    function getMembership() external view returns (bool) {
        return _isMember[msg.sender];
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC721, ERC721Enumerable) {
        _isMember[from] = false;
        _isMember[to] = true;
        super._beforeTokenTransfer(from, to, amount);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        _isMember[ownerOf(tokenId)] = false;
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

}
