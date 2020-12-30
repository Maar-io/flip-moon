// Example test script - Uses Mocha and Ganache
const Token = artifacts.require("Flipcoin");
const truffleAssert = require("truffle-assertions");

contract('Flipcoin', accounts => {

    let instance;
  let ownerAcc = accounts[0];
  let userAcc =  accounts[3];
  let payment = web3.utils.toWei("1", "ether");

  before(async function(){
    instance = await Flipcoin.deployed()
  });

  it("should validate increase in contact balance", async function(){
    await instance.depositFunds({from: ownerAcc, value: payment});
    let contractBalance = await web3.eth.getContractBalance(instance.address);
    let variableBalance = await instance.balance();
    assert(contractBalance == variableBalance, "Problem with contract balance" + contractBalance + " " + variableBalance);
    assert(variableBalance == payment, "Problem with contract balance value" + variableBalance + " " + payment);
  });

    /*
    let token;
    const _totalSupply = "8000000000000000000000000";
    beforeEach(async () => {
        // Deploy token contract
        token = await Token.new(_totalSupply, { from: accounts[0] });
    });
    // Check Total Supply
    it("checks total supply", async () => {
        const totalSupply = await token.totalSupply.call();
        assert.equal(totalSupply, _totalSupply, 'total supply is wrong');
    });

    // Check the balance of the owner of the contract
    it("should return the balance of token owner", async () => {
        const balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, _totalSupply, 'balance is wrong');
    });

    // Transfer token and check balances
    it("should transfer token", async () => {
        const amount = "1000000000000000000";
        // Transfer method
        await token.transfer(accounts[1], amount, { from: accounts[0] });
        balance1 = await token.balanceOf.call(accounts[1]);
        assert.equal(balance1, amount, 'accounts[1] balance is wrong');
    });

    // Set an allowance to an account, transfer from that account, check balances
    it("should give accounts[1] authority to spend accounts[0]'s token", async () => {
        const amountAllow = "10000000000000000000";
        const amountTransfer = "1000000000000000000";

        // Approve accounts[1] to spend from accounts[0]
        await token.approve(accounts[1], amountAllow, { from: accounts[0] });
        const allowance = await token.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance, amountAllow, 'allowance is wrong');

        // Transfer tokens and check new balances
        await token.transferFrom(accounts[0], accounts[2], amountTransfer, { from: accounts[1] });
        const balance1 = await token.balanceOf.call(accounts[1]);
        assert.equal(balance1, 0, 'accounts[1] balance is wrong');
        const balance2 = await token.balanceOf.call(accounts[2]);
        assert.equal(balance2, amountTransfer, 'accounts[2] balance is wrong');
    })
    */
});
