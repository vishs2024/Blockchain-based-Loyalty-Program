const LoyaltyToken = artifacts.require("LoyaltyToken");
const LoyaltyProgram = artifacts.require("LoyaltyProgram");

module.exports = async function (deployer) {
  // Deploy LoyaltyToken
  await deployer.deploy(LoyaltyToken);
  const loyaltyToken = await LoyaltyToken.deployed();

  // Deploy LoyaltyProgram with the address of LoyaltyToken
  await deployer.deploy(LoyaltyProgram, loyaltyToken.address);
  const loyaltyProgram = await LoyaltyProgram.deployed();

  // Transfer ownership of LoyaltyToken to LoyaltyProgram contract
  await loyaltyToken.transferOwnership(loyaltyProgram.address);

  console.log("LoyaltyToken deployed at:", loyaltyToken.address);
  console.log("LoyaltyProgram deployed at:", loyaltyProgram.address);
};
