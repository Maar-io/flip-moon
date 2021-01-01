// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
import "./Ownable.sol";

contract Flipcoin is Ownable{

    struct Player {
      uint lost;
      uint won;
      uint plays;
      bytes32 provableQuery;
      bool betOnHead;
      uint downPayment;
    }
    uint public balance;
    uint nonce = 0;
    mapping (address => Player) private gambler;
    address payable[] public creators;
    
    // CONSTANTS
    uint constant MIN_BET = 0.01 ether;

    // EVENTS
    event playerRegistered(address adr);
    event coinFlipResult(string messageToPlayer, address creator, uint toTransfer);
    
    // MODIFIERS
    modifier costs(uint msgFunds){
        require(msg.value >= msgFunds);
        _;
    }

    // used to fill up the bet pool
    function depositFunds() public payable onlyOwner{
        balance += msg.value;
    }
    
    //check if this is revisiting player
    function _isRegistered(address sender) private{
        bool userRegistered = false;
        for (uint i=0; i<creators.length; i++) {
            if (sender == creators[i]){
                userRegistered = true;
                break;
            }
        }
        //Register new player
        if(!userRegistered){
            register();
        }
    }

    // if the player is first time here, make a new entry
    function register() private{
        Player memory newPlayer;
        address payable creator = msg.sender;
        
        //This creates a player
        newPlayer.lost = 0;
        newPlayer.won = 0;
        newPlayer.plays = 0;
        newPlayer.downPayment = 0;
        gambler[creator] = newPlayer; //create new gambler entry
        creators.push(creator); //save player's address to creators array
        emit playerRegistered(creator);
    }
    
    // player placed a bet
    function flipCoin(bool betOnHead) public payable costs(MIN_BET){
        uint downPayment = msg.value;

        balance += downPayment;
        _isRegistered(msg.sender);
        uint256 randomNumber = _pseudoRandom(msg.sender);
        gambler[msg.sender].plays++;
        gambler[msg.sender].downPayment = downPayment;
        gambler[msg.sender].betOnHead = betOnHead;
        _isWinner(msg.sender, randomNumber);
    }

    // create pseudo random number 0 or 1
    function _pseudoRandom(address sender) private returns (uint){
         uint random = uint(keccak256(abi.encodePacked(block.timestamp, sender, nonce))) % 2;
         nonce++;
         return random;
    }

    // compare random with the player's bet
    function _isWinner(address payable creator, uint256 randomNumber) private{
        bool betOnHead;
        if(randomNumber == 1){
            betOnHead = true;
        }
        else if(randomNumber == 0){
            betOnHead = false;
        }
        else{
            assert(false);
        }
        if (betOnHead == gambler[creator].betOnHead) {
            gambler[creator].won++;
            _sendFundsToWinner(creator);
        }
        else{
            gambler[creator].lost++;
            emit coinFlipResult("Player lost, Contract keeps it all :)", creator, 0);
        }
    }

    //if player won, send the reward
    function _sendFundsToWinner(address payable creator) private{
       uint toTransfer = gambler[creator].downPayment * 2;
       balance -= toTransfer;
       creator.transfer(toTransfer);
       emit coinFlipResult("Player won!!!, Funds sent to player ", creator, toTransfer);
    } 
    
    //used by frontend for statistics
    function getPlayerData() public view returns(uint won, uint lost, uint plays){
        address creator = msg.sender;
        return (gambler[creator].won, gambler[creator].lost, gambler[creator].plays);
    }
    
    //used by frontend for statistics
    function getContractBalance() public view returns (uint){
        return balance;
    }

    //withraw all funds
    function withdrawAll() public onlyOwner returns(uint) {
       uint toTransfer = balance;
       balance = 0;
       msg.sender.transfer(toTransfer);
       return toTransfer;
    }
}
