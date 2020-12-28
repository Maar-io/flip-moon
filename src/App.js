import { useState, useEffect} from 'react'
import Web3 from 'web3'

function App() {
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState(0)
  const [connected, setConnected] = useState(false)

  async function loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      setConnected(true)
      console.log("connected ", connected)
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
      setConnected(true)
      console.log("web3 connected ", connected)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  } 

  async function loadBlockchainData() {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
      console.log("web3 version = " + web3.version);
      console.log("load connected ", connected)
      console.log(web3)
      const network = await web3.eth.net.getNetworkType()
      console.log(network)
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
    }

  useEffect(() => {
    loadBlockchainData()
  }, [connected, balance])

  if (connected) {
    return (
      <>
      <h4> Connected account: {account}</h4>
      <h4> Balance in ETH: {balance}</h4>
      </>
    )
  }
  else{
      return(
    <button onClick={loadWeb3} >Connect</button>
  )
      }
}
export default App;
