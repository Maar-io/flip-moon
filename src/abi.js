export default {
    address: "0xA0886958c8aF74B99402Bba5dF520C8D14AeD0aE",
    abi: [
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "messageToPlayer",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "toTransfer",
              "type": "uint256"
            }
          ],
          "name": "coinFlipResult",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "adr",
              "type": "address"
            }
          ],
          "name": "playerRegistered",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "balance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "creators",
          "outputs": [
            {
              "internalType": "address payable",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "depositFunds",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
          "payable": true
        },
        {
          "inputs": [
            {
              "internalType": "bool",
              "name": "betOnHead",
              "type": "bool"
            }
          ],
          "name": "flipCoin",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function",
          "payable": true
        },
        {
          "inputs": [],
          "name": "getPlayerData",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "won",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "lost",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "plays",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "getContractBalance",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function",
          "constant": true
        },
        {
          "inputs": [],
          "name": "withdrawAll",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
}