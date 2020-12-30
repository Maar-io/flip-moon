import { useState, useEffect} from 'react'
import Web3 from 'web3'
import abiJson from './abi';

const MOONBASE_ALPHA = 'https://rpc.testnet.moonbeam.network'
const CONTRACT_ADDRESS = "0x940cc8AdBe79404Ee50220B42437e62127b024Dc";
var contractInstance;

const web3 = new Web3(Web3.givenProvider || "http://localhost:9933")
console.log("web3 version = " + web3.version);

function App() {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState(0)
  const [connected, setConnected] = useState(false)

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(MOONBASE_ALPHA)
      await window.ethereum.enable()
      setConnected(true)
      console.log("connected ", connected)

    }
    else if (window.web3) {
      window.web3 = new Web3(MOONBASE_ALPHA)
      setConnected(true)
      console.log("web3 connected ", connected)
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
    
    if (accounts[0]){
      web3.eth.getBalance(accounts[0]).then(bal => {
        setBalance(web3.utils.fromWei(bal, 'ether'))
      })
    }
    console.log("Balance in ETH", balance)
    if(!contractInstance){
      contractInstance = new web3.eth.Contract(abiJson.abi, CONTRACT_ADDRESS, {from: accounts[0]});
      console.log("new contractInstance", contractInstance)
    }
    else console.log("existing contractInstance", contractInstance)
  }

  async function getContractBalance() {
      console.log("Refresh statistics");
      contractInstance.methods.getPlayerData().call()
      .then((res) => {
              console.log("statistics", res);
          });
  }

  useEffect(() => {
    loadBlockchainData()
  }, [connected, balance])

  if (!connected) {
    return (
      <button onClick={loadWeb3} >Connect</button>
    )
  }
  else{
    return(
      <>
      <h4> Connected account: {account}</h4>
      <h4> Balance in ETH: {balance}</h4>
      <button onClick={getContractBalance} >ContractBalance</button>
      </>
    )
  }
}
export default App;
