//parent contract 
pragma solidity >0.4.99 <0.6.0;


contract Ownable {
    //state variables 
    address payable owner; 

    modifier onlyOwner() {
        require(msg.sender == owner, "This function can only be called by the contract owner");
        _;
    }

    constructor() public {
        owner = msg.sender;
    }
}