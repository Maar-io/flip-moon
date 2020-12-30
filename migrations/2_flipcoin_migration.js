const Flipcoin = artifacts.require("Flipcoin");

module.exports = function(deployer) {
  deployer.deploy(Flipcoin);
};
