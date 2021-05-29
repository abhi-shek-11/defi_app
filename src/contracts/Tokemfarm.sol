//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

import "./DaiToken.sol";
import "./DappToken.sol";

contract TokenFarm{
    string public name = "Dapp token farm";

    DappToken public dappToken;  // state variables;
    DaiToken public daiToken;
    address public owner;

    address[] public stakers;  // stores all addresses

    mapping(address => uint) public stakingBalance; // store balance of eache address.

    mapping (address => bool) public hasStaked; // check whether an address has staked or not
    mapping (address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }


    // 1.Stake Tokens (Deposit)
    function stakeTokens(uint _amount) public{

        require(_amount>0, "amount must be greater than 0"); // check if investor has positive tokens to invest

        // Transfer Dai token to this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);

        stakingBalance[msg.sender]+= _amount;

        if(!hasStaked[msg.sender]){
            stakers.push(msg.sender);     // add investor if not already present.
        }

        hasStaked[msg.sender] = true;
        isStaking[msg.sender] = true;
    }

    // 2. Issue Tokens
    function issueTokens() public{
        require(msg.sender==owner,"caller must be owner");

        for(uint i=0;i<stakers.length;i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance>0){
                dappToken.transfer(recipient, balance);
            }
            
        }
    }

    // 3. unstake token (withdraw)
    function unstakeTokens() public{
        uint balance = stakingBalance[msg.sender];

        require(balance>0, "amount must be greater than 0");

        daiToken.transfer(msg.sender, balance);

        stakingBalance[msg.sender]=0;

        isStaking[msg.sender]=false;


    }


}
