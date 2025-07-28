// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoyaltyToken is ERC20, Ownable {
    constructor() ERC20("Loyalty Token", "LT") {
        _mint(msg.sender, 1_000_000 * 10 ** decimals()); // Initial supply to owner
    }

    /// @notice Mint new tokens to a customer (only owner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from a customer (only owner)
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
