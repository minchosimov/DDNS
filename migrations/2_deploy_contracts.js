var ddns = artifacts.require("DDNS");

module.exports = function(deployer) {
  deployer.deploy(ddns);
};