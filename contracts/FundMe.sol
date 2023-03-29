//Get funds from user
//withdraw funds
// set a minimum funding value in rupee

//SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./PriceConvertor.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConvertor for uint256;

    address private immutable i_owner;

    uint256 public constant MINMUSD = 50 * 1e18;

    address[] private funders;
    mapping(address => uint256) private addressToAmountFunded;

    AggregatorV3Interface private priceFeed;

    // we also used the onlyOwner modifier
    // we created a modifier to check whether the sender of the contract is the actual owner of it.
    modifier onlyOnwer() {
        //require(msg.sender == i_owner, " Sender is not the owner of the contract deployed. ");

        // this is the another method of saying the require statement!
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // we are adding and receive and fallback special functions. These both are used in case the use dont call the fund function and transcat directly with the help of address.
    // In that case, if we send ethers the receive will be called. and if we send data, fallback would be called.
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // maan lo agar koi hume fund krna chahtaa hai they to atleast send us the minimum usd which we decide. For that we are using the require statement.

        require(
            msg.value.getConversionRate(priceFeed) >= MINMUSD,
            "You need to spend more ETH!"
        );

        // after making the price convertor library now we can use the function as if they are really a function.

        // if require statement is met we must add that funder to our funders array list and also map its amount to their address.

        funders.push(msg.sender);

        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOnwer {
        // this is added in order to optimise the gase expense by calling the funders object only once before the loop
        address[] memory m_funders = funders;

        for (uint256 index = 0; index < m_funders.length; index++) {
            address OfFunder = m_funders[index];

            addressToAmountFunded[OfFunder] = 0;
        }

        // reseting the array/
        funders = new address[](0);

        // msg.sender is equal to address
        // payable(msg.sender) ==> payable address.

        /*
         1. transfer
      payable(msg.sender).transfer(address(this).balance);

       2. send 
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "Sorry didnt get the fund!");

        // 3. call

        */
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call didn't happen smoothly!");
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return addressToAmountFunded[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }
}
