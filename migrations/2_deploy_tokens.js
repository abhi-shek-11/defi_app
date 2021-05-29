const DappToken = artifacts.require("DappToken")
const DaiToken = artifacts.require("DaiToken")
const TokenFarm = artifacts.require("TokenFarm")

module.exports = async function(deployer, network , accounts) {
  //deploy mock dai token
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed() 

  //deploy dapp Token
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()
  
  //deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address , daiToken.address)
  const tokenFarm = await TokenFarm.deployed()

  dappToken.transfer(tokenFarm.address,'1000000000000000000000000') // 1 mil tokens

  // most tokens have 18 decomal places, and solidity doesnt handles decimals
  // so  1 token = 1000000000000000000 

  // transfer 100 tokens in 2nd acccount
  daiToken.transfer(accounts[1], '1000000000000000000')
}
