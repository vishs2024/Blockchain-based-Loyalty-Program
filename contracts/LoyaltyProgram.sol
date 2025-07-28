// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILoyaltyToken {
    function balanceOf(address account) external view returns (uint256);
    function burn(address from, uint256 amount) external;
    function mint(address to, uint256 amount) external;
}

contract LoyaltyProgram is ReentrancyGuard, Ownable {
    ILoyaltyToken public loyaltyToken;

    constructor(address tokenAddress) {
        loyaltyToken = ILoyaltyToken(tokenAddress);
    }

    struct Customer {
        bool isRegistered;
        uint256 totalRedeemed;
        uint256 lastActivity;
    }

    struct Reward {
        string name;
        uint256 cost;
        uint256 stock;
        bool isActive;
    }

    mapping(address => Customer) public customers;
    mapping(uint256 => Reward) public rewards;
    mapping(address => mapping(uint256 => bool)) public customerRedemptions;

    uint256 public rewardCount;

    // Events
    event CustomerRegistered(address indexed customer);
    event RewardAdded(uint256 indexed rewardId, string name, uint256 cost, uint256 stock);
    event RewardUpdated(uint256 indexed rewardId, string name, uint256 cost, uint256 stock, bool active);
    event PointsRedeemed(address indexed customer, uint256 rewardId, uint256 cost);
    event RedeemSuccess(address indexed customer, uint256 rewardId, string rewardName, uint256 cost);
    event TokensMinted(address indexed customer, uint256 amount);

    // Customer registration
    function registerCustomer() external {
        require(!customers[msg.sender].isRegistered, "Already registered");
        customers[msg.sender] = Customer({
            isRegistered: true,
            totalRedeemed: 0,
            lastActivity: block.timestamp
        });
        emit CustomerRegistered(msg.sender);
    }

    // Redeem reward
    function redeemReward(uint256 rewardId) external nonReentrant {
        require(customers[msg.sender].isRegistered, "Customer not registered");
        require(rewardId < rewardCount, "Invalid reward ID");

        Reward storage reward = rewards[rewardId];
        require(reward.isActive, "Reward not active");
        require(reward.stock > 0, "Reward out of stock");
        require(!customerRedemptions[msg.sender][rewardId], "Reward already redeemed");

        uint256 cost = reward.cost;
        require(loyaltyToken.balanceOf(msg.sender) >= cost, "Insufficient points");

        loyaltyToken.burn(msg.sender, cost);

        customers[msg.sender].totalRedeemed += cost;
        customers[msg.sender].lastActivity = block.timestamp;
        reward.stock--;
        customerRedemptions[msg.sender][rewardId] = true;

        emit PointsRedeemed(msg.sender, rewardId, cost);
        emit RedeemSuccess(msg.sender, rewardId, reward.name, cost);
    }
    function removeReward(uint256 rewardId) external onlyOwner {
    require(rewardId < rewardCount, "Invalid reward ID");
    delete rewards[rewardId];
    emit RewardRemoved(rewardId);
}

// Add this event with your other events
event RewardRemoved(uint256 indexed rewardId);

    // Admin functions

    function addReward(string memory name, uint256 cost, uint256 stock) external onlyOwner {
        rewards[rewardCount] = Reward({
            name: name,
            cost: cost,
            stock: stock,
            isActive: true
        });

        emit RewardAdded(rewardCount, name, cost, stock);
        rewardCount++;
    }

    function updateReward(
        uint256 rewardId,
        string memory name,
        uint256 cost,
        uint256 stock,
        bool isActive
    ) external onlyOwner {
        require(rewardId < rewardCount, "Invalid reward ID");
        rewards[rewardId] = Reward({
            name: name,
            cost: cost,
            stock: stock,
            isActive: isActive
        });

        emit RewardUpdated(rewardId, name, cost, stock, isActive);
    }

    function mintTokens(address customer, uint256 amount) external onlyOwner {
        require(customers[customer].isRegistered, "Customer not registered");
        loyaltyToken.mint(customer, amount);
        emit TokensMinted(customer, amount);
    }

    function setRewardActive(uint256 rewardId, bool isActive) external onlyOwner {
        require(rewardId < rewardCount, "Invalid reward ID");
        rewards[rewardId].isActive = isActive;
    }

    function restockReward(uint256 rewardId, uint256 newStock) external onlyOwner {
        require(rewardId < rewardCount, "Invalid reward ID");
        rewards[rewardId].stock = newStock;
    }

    // Getters

    function getReward(uint256 rewardId) external view returns (Reward memory) {
        return rewards[rewardId];
    }

    function hasRedeemed(address customer, uint256 rewardId) external view returns (bool) {
        return customerRedemptions[customer][rewardId];
    }
}
