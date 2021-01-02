import { useState, useEffect } from 'react'
import Web3 from 'web3'
import abiJson from './abi';
import { Button, Container, Row, Card, Col, Form, Badge, Jumbotron } from 'react-bootstrap';
import Balance from './components/Balance'
import ConnectedAccount from './components/ConnectedAccount'
import styled from 'styled-components';

const MOONBASE_ALPHA = 'https://rpc.testnet.moonbeam.network'
const OWNER = "0x8F10433FC11b70a15128aAF0b30B906627808296"
const RESULT_UNKNOWN = 'result ❔'
const RESULT_WON = 'You won 👍'
const RESULT_LOST = 'You lost 👎'
const DEPOSIT_AMOUNT = '1000' //milli

var contractInstance;

const web3 = new Web3(Web3.givenProvider || "http://localhost:9933")
console.log("web3 version = " + web3.version);


function App() {
  const radios = [
    { name: "0.01 DEV", value: "10" },
    { name: "0.02 DEV", value: "20" },
    { name: "0.05 DEV", value: "50" },
    { name: "0.1 DEV", value: "100" },
  ];
  const [account, setAccount] = useState('')
  const [accountBalance, setAccountBalance] = useState(0)
  const [contractBalance, setContractBalance] = useState(0)
  const [betResult, setBetResult] = useState(RESULT_UNKNOWN)
  const [connected, setConnected] = useState(false)
  const [statistics, setStatistics] = useState({})
  const [betAmount, setBetAmount] = useState(radios[0].value)
  const Styles = styled.div`
  .jumbo {
    background: 
    linear-gradient(
      rgb(29, 37, 82), 
      rgb(83, 203, 200)
    );
  }
`;

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
    getPlayerData()
    setBetResult(RESULT_UNKNOWN)
  }

  async function getPlayerData() {
    console.log("Refresh statistics");
    contractInstance.methods.getPlayerData().call()
      .then((res) => {
        console.log("statistics", res);
        setStatistics(res)
      });
  }

  async function getContractBalance() {
    console.log("get Contract Balance")
    contractInstance.methods.getContractBalance().call()
      .then((res) => {
        console.log("getContractBalance", res)
        setContractBalance(web3.utils.fromWei(res, 'ether'))
      });
  }

  async function flipCoin(betHead) {
    console.log("flipCoin", account, betHead);
    setBetResult('waiting blockchain result... 🐌')
    var weiValue = web3.utils.toWei(betAmount, 'milli');
    contractInstance.methods.flipCoin(betHead).send({ from: account, gas: 3000000, value: weiValue })
      .then((res) => {
        console.log("flipCoin", res);
      });
  }

  async function deposit() {
    console.log("deposit", DEPOSIT_AMOUNT);
    var weiValue = web3.utils.toWei(DEPOSIT_AMOUNT, 'milli');
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
          setBetResult(RESULT_WON)
          console.log("You won!!!!!");
        }
        else {
          setBetResult(RESULT_LOST)
          console.log("You lost :(");
        }
        getPlayerData()
      }
      else {
        setBetResult("error in coinFlipResult")
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
      <Styles>
        <Jumbotron fluid className="jumbo">
          <Container>
            <h1>Coin Flip on Moonbase</h1>
         <p>This is a simple gambling dApp deployed on the Moonbase Alpha testnet.
         In order to connect to this app you will need Metamask or similar wallet.</p>
            <p>
              <p></p>
              <Button onClick={loadWeb3} >Connect to Moonbase Alpha</Button>
            </p>
          </Container>
        </Jumbotron>
      </Styles>
    )
  }
  else {
    return (
      <Container fluid='md'>
        <Row >
          <Col>
            logo
          </Col>
          <Col>
            <ConnectedAccount account={account} />
          </Col>
        </Row>
        <Row>
          <Balance contractBal={contractBalance} accountBal={accountBalance} />
        </Row>
        <Row>
          <Card border="info" style={{ width: '18rem', margin: 5 }}>
            <Card.Body>
              <Card.Title> 1. Pick your bet amount </Card.Title>
              <Form>
                <div className="mb-3">
                  {radios.map((radio, index) => (
                    <Form.Check name='radios'
                      label={radio.name}
                      type='radio'
                      id={radio.name}
                      value={radio.value}
                      checked={betAmount === radio.value}
                      onChange={e => setBetAmount(e.currentTarget.value)} />
                  ))}
                </div>
              </Form>
            </Card.Body>
          </Card>
          <Card border="info" style={{ width: '18rem', margin: 5 }}>
            <Card.Body>
              <Card.Title> 2. Press button to place your bet </Card.Title>
              <Card.Text>
                <Button onClick={() => flipCoin(true)}>Head</Button>{' '}
                <Button onClick={() => flipCoin(false)}>Tail</Button>
              </Card.Text>
              <Card.Footer>
                <h5>{betResult}</h5>
              </Card.Footer>
            </Card.Body>
          </Card>
          <Card border="info" style={{ width: '18rem', margin: 5 }}>
            <Card.Body>
              <Card.Title> 3. Account statistics</Card.Title>
              <Card.Text>Plays:{statistics.plays} </Card.Text>
              <Card.Text>Won:  {statistics.won} </Card.Text>
              <Card.Text>Lost: {statistics.lost} </Card.Text>
            </Card.Body>
          </Card>
        </Row>
        <Row>
          <Badge>
            Contract address on
            <a href="https://docs.moonbeam.network/networks/testnet/">Moonbase Alpha:</a> {abiJson.address}
          </Badge>
        </Row>
        {(account === OWNER) ? (
          <Row>
            <Button onClick={deposit} >Deposit</Button>
            <Button onClick={withdrawAll} >withdrawAll</Button>
          </Row>
        ) : null}
      </Container>
    )
  }
}
export default App;
