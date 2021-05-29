const { assert } = require("chai");
const { Item } = require("react-bootstrap/lib/Breadcrumb");

const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
  .use(require("chai-as-promised"))
  .should();

// helper funtion when we have to  transfer tokens
function tokens(n) {
  return web3.utils.toWei(n, "Ether");
}

contract("TokenFarm", ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    // load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // transfer tokens
    await dappToken.transfer(tokenFarm.address, tokens("1000000")); // 1 mil tokens

    //send tokens to investor
    await daiToken.transfer(investor, tokens("100"), { from: owner });
  });
  describe("Mock Dai deployment", async () => {
    it("has a name", async () => {
      const name = await daiToken.name();
      assert.equal(name, "Mock DAI Token");
    });
  });

  describe("DappToken deployment", async () => {
    it("has a name", async () => {
      const name = await dappToken.name();
      assert.equal(name, "DApp Token");
    });
  });

  describe("TokenFarm deployment", async () => {
    it("has a name", async () => {
      const name = await tokenFarm.name();
      assert.equal(name, "Dapp token farm");
    });

    it("has tokens", async () => {
      const balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance, tokens("1000000"));
    });
  });

  describe("Farming Tokens", async () => {
    it("gives rewards", async () => {
      let res;
      res = await daiToken.balanceOf(investor);

      assert.equal(
        res.toString(),
        tokens("100"),
        "investor Mock Dai wallet balance correct before staking "
      );

      // stake tokens
      await daiToken.approve(tokenFarm.address, tokens("100"), {
        from: investor,
      });
      await tokenFarm.stakeTokens(tokens("100"), { from: investor });

      res = await daiToken.balanceOf(investor);
      assert.equal(
        res.toString(),
        tokens("0"),
        "investor Mock Dai wallet balance correct after staking "
      );

      res = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        res.toString(),
        tokens("100"),
        "tokenFarm Mock Dai wallet balance correct after staking "
      );

      res = await tokenFarm.stakingBalance(investor);
      assert.equal(
        res.toString(),
        tokens("100"),
        "investor staking balance correct after staking "
      );

      res = await tokenFarm.isStaking(investor);
      assert.equal(
        res.toString(),
        "true",
        "investor staking status correct after staking "
      );

      // issue tokens
      await tokenFarm.issueTokens({ from: owner }); // only owner can issue tokens

      //check dapp wallet balance of investor
      res = await dappToken.balanceOf(investor);
      assert.equal(
        res.toString(),
        tokens("100"),
        "invest dapp wallet balance correct after issuance"
      );

      await tokenFarm.issueTokens({ from: investor }).should.be.rejected; // investor can issue tokens

      await tokenFarm.unstakeTokens({ from: investor });

      res = await daiToken.balanceOf(investor);
      assert.equal(
        res.toString(),
        tokens("100"),
        "investor dai token balance correct after unstaking"
      );
      res = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(
        res.toString(),
        tokens("0"),
        "tokenfarm dai token balance correct after unstaking"
      );

      res = await tokenFarm.stakingBalance(investor);
      assert.equal(
        res.toString(),
        tokens("0"),
        "investor dai token stakingbalance correct after unstaking"
      );

      res = await tokenFarm.isStaking(investor);
      assert.equal(
        res.toString(),
        "false",
        "investor staking status correct after unstaking"
      );
    });
  });
});
