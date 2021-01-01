import { useState, useEffect } from 'react'
import Web3 from 'web3'
import abiJson from './abi';
import { Button, Container, Row } from 'react-bootstrap';
import Balance from './components/Balance'
import ConnectedAccount from './components/ConnectedAccount'

const MOONBASE_ALPHA = 'https://rpc.testnet.moonbeam.network'
const OWNER = "0x8F10433FC11b70a15128aAF0b30B906627808296"
var contractInstance;

const web3 = new Web3(Web3.givenProvider || "http://localhost:9933")
console.log("web3 version = " + web3.version);


function App() {
  const [account, setAccount] = useState('')
  const [accountBalance, setAccountBalance] = useState(0)
  const [contractBalance, setContractBalance] = useState(0)

  const [connected, setConnected] = useState(false)

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(MOONBASE_ALPHA)
      await window.ethereum.enable()
      setConnected(true)
      console.log("connected ", connected)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async function loadBlockchainData() {

    const network = await web3.eth.net.getNetworkType()
    console.log(network)

    console.log("load connected ", connected)

    const accounts = await web3.eth.getAccounts()
    console.log("accounts", accounts)
    setAccount(accounts[0])
    console.log("accounts[0]=", accounts[0])

    if (accounts[0]) {
      web3.eth.getBalance(accounts[0]).then(bal => {
        setAccountBalance(web3.utils.fromWei(bal, 'ether'))
      })
    }
    console.log("Balance in ETH", accountBalance)
    if (!contractInstance) {
      contractInstance = new web3.eth.Contract(abiJson.abi, abiJson.address, { from: accounts[0] });
      console.log("new contractInstance", contractInstance)
    }
    else console.log("existing contractInstance", contractInstance)
    eventListener()
    getContractBalance()
  }

  async function getPlayerData() {
    console.log("Refresh statistics");
    contractInstance.methods.getPlayerData().call()
      .then((res) => {
        console.log("statistics", res);
      });
  }

  async function getContractBalance() {
    console.log("get Contract Balance")
    contractInstance.methods.getContractBalance().call()
      .then((res) => {
        console.log("getContractBalance", res)
        setContractBalance(res)
      });
  }

  async function flipCoin(betHead) {
    console.log("flipCoin", account, betHead);
    var weiValue = web3.utils.toWei('10', 'milli');
    contractInstance.methods.flipCoin(betHead).send({ from: account, gas: 3000000, value: weiValue })
      .then((res) => {
        console.log("flipCoin", res);
      });
  }

  async function deposit() {
    console.log("deposit");
    var weiValue = web3.utils.toWei('100', 'milli');
    contractInstance.methods.depositFunds().send({ OWNER, gas: 3000000, value: weiValue })
      .on('receipt', function (rec) {

        console.log("deposit receipt", rec);
      })
      .on('error', function (err) {
        console.log("deposit err", err);
      });
  }

  async function withdrawAll() {
    console.log("withdrawAll");
    var transferedBalance = contractInstance.methods.withdrawAll().call()
      .on('receipt', (rec) => {
        console.log("transferedBalance", transferedBalance);
        console.log("withdrawAll receipt", rec);
      })
      .on('error', (err) => {
        console.log("withdrawAll err", err);
      });
  }

  function eventListener() {
    console.log("set event listeners");
    contractInstance.events.playerRegistered(function (error, result) {
      console.log("Recieved Event playerRegistered");
      if (!error) {
        console.log("Player " + result["returnValues"][0] + " is registered with contract");
      }
      else {
        console.log("error in playerRegistered");
        console.log(error);
      }
    });

    contractInstance.events.coinFlipResult(function (error, result) {
      console.log("Recieved Event coinFlipResult");
      if (!error) {
        console.log("flip result", result);
        if (result["returnValues"][2] > 0) {
          console.log("You won!!!!!");
        }
        else {
          console.log("You lost :(");
        }
      }
      else {
        console.log("error in coinFlipResult");
        console.log(error);
      }
    });
  }

  useEffect(() => {
    loadBlockchainData()
  }, [connected, accountBalance])

  if (!connected) {
    return (
      <Container fluid='true'>
        <Row>
          <Button  onClick={loadWeb3} >Connect to Moon-flip</Button>
        </Row>
      </Container>

    )
  }
  else {
    return (
      <>
        <ConnectedAccount account={account} />
        <Balance contractBal={contractBalance} accountBal={accountBalance} />
        {/* <Button onClick={getContractBalance} >ContractBalance</Button> */}
        <Button onClick={getPlayerData} >getPlayerData</Button>
        <Button onClick={deposit} >Deposit</Button>
        <Button onClick={withdrawAll} >withdrawAll</Button>
        <Button onClick={() => flipCoin(true)}>Head</Button>
        <Button onClick={() => flipCoin(false)}>Tail</Button>
      </>
    )
  }
}
export default App;
