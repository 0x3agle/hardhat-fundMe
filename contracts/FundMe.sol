/*
    1. People will send you cryptocurency in terms of USD
    a. Make a payable function to recieve ether
    b. A function to get the USD value of ether
        i. Importing AggregatorV3Interface from github
    c. A function to convert ether to its USD equivalent
    2. Only you can Withdraw it
*/

//SPDX-License-Identifier:MIT
pragma solidity ^0.8.8;
import "./PriceConverter.sol";

error FundMe__notOwner();

/**
 * @title FundMe Contract
 * @author Priyam Soni
 * @notice This contract is to demo a sample crowd funding
 * @dev This contract implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    address[] private s_funders;
    mapping(address => uint256) private s_funded;
    AggregatorV3Interface private s_priceFeed;

    address private immutable i_owner;
    uint256 public constant MIN_USD = 50 * 10 ** 18;

    modifier onlyOwner() {
        /**
         * @notice Checking if the withdraw function is called by the owner
         * @custom:oldsyntax require(msg.sender == i_owner,"You are not the owner");
         */
        if (msg.sender != i_owner) {
            revert FundMe__notOwner();
        }
        //Running the rest of the code
        _;
    }

    /**
     * @notice Assign the owner as the address deploying the contract
     */
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @notice Called when a funder sends fund to smart contract
     */

    function fund() public payable {
        //Condition to receive a minimum amount
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "Minimum amount you can send is $50"
        );
        //storing address of funder in an array
        s_funders.push(msg.sender);
        //Mapping the total amount to funder using funded mapper
        s_funded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        //Clearing all the fund mappings for each funder
        for (uint i = 0; i < s_funders.length; i++) {
            address funder = s_funders[i];
            s_funded[funder] = 0;
        }

        //Resetting the array
        s_funders = new address[](0);

        /*
            Withdrawing funds from smart conract.There are three ways:
            1. Transfer
            payable(msg.sender).transfer(address(this).balance);
            2. Send
            bool sendSuccess = payable(msg.sender).send(address(this).balance);
            require(sendSuccess,"Send Failed");
            3.Call
        */

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory _funders = s_funders;
        for (uint i = 0; i < _funders.length; i++) {
            address funder = _funders[i];
            s_funded[funder] = 0;
        }
        //Resetting the array
        s_funders = new address[](0);

        /*
            Withdrawing funds from smart conract.There are three ways:
            1. Transfer
            payable(msg.sender).transfer(address(this).balance);
            2. Send
            bool sendSuccess = payable(msg.sender).send(address(this).balance);
            require(sendSuccess,"Send Failed");
            3.Call
        */

        (bool callSuccess, ) = payable(i_owner).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed");
    }

    /**
     * @notice Getter Functions
     */

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint index) public view returns (address) {
        return s_funders[index];
    }

    function getFunded(address funder) public view returns (uint) {
        return s_funded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
