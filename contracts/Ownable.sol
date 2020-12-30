// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract Ownable{
    address public owner;

    modifier onlyOwner(){
        require(msg.sender == owner);
        _; //Continue execution
    }

    constructor() {
        owner = msg.sender;
    }
}