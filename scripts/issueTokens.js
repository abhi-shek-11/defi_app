const TokenFarm = artifacts.require("TokenFarm");

module.exports = async function(callback) {
  //deploy mock dai token

  let tokenFarm = await TokenFarm.deployed();
  await tokenFarm.issueTokens();

  console.log("tokens issued");

  callback();
};
