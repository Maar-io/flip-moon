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
    uint MIN_BET = 0.01 ether;
    uint256 constant MAX_INT_FROM_BYTE = 256;
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;
    bytes m_proof;
    mapping (address => Player) private gambler;
    address payable[] public creators; //TODO change to private
    
    // EVENTS
    event playerRegistered(address adr);
    event coinFlipResult(string messageToPlayer, address creator, uint toTransfer);
    
    // MODIFIERS
    modifier costs(uint msgFunds){
        require(msg.value >= msgFunds);
        _;
    }
/*
    //get random number through Oracle
    function queryOracle() payable public returns (bytes32)
    {
        uint256 QUERY_EXECUTION_DELAY = 0;
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32  queryId = provable_newRandomDSQuery(
            QUERY_EXECUTION_DELAY,
            NUM_RANDOM_BYTES_REQUESTED,
            GAS_FOR_CALLBACK
        );
        emit provableQuerySent("provable queried", msg.sender);
        return queryId;
    }

    // oracle callback function for random number
    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        require(msg.sender == provable_cbAddress());
        m_proof = _proof; //TODO not used
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(_result))) % 2;
        updatePlayer(_queryId, randomNumber);
    }

    function updatePlayer(bytes32 queryId, uint256 randomNumber) private{
        address payable creator;
        for (uint i=0; i<creators.length; i++){
            creator = creators[i];
            if (gambler[creator].provableQuery == queryId){
                gambler[creator].provableQuery = 0;
                gambler[creator].provableQuery = 0;
                break;
            }
        }
        isWinner(creator, randomNumber);
    }

    // used only for testing purposes to bypass oracle
    function testRandom() public returns (bytes32){
        bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
        __callback(queryId, "1", bytes("test"));
        emit provableQuerySent("test provable queried", msg.sender);
        return queryId;
    }
*/
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
        uint256 randomNumber = _pseudoRandom();
        gambler[msg.sender].plays++;
        gambler[msg.sender].downPayment = downPayment;
        gambler[msg.sender].betOnHead = betOnHead;
        _isWinner(msg.sender, randomNumber);
    }

    function _pseudoRandom() private view returns (uint){
        uint rdm = block.timestamp % 2;
        if (rdm == 1){
            return 1;
        }
        return 0;
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
