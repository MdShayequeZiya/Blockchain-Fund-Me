//SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// we are making this library for making the function more explicit.

// This can be done by the keyword library.

library PriceConvertor {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        // Since this is the instance of blockchain intereacting with the data outside the world, so we need two things in order to do so.
        // ABI of the contract
        // Address of the contract which we wanna interact.    0x694AA1769357215DE4FAC081bf1f309aDC325306

        //iss line of code se kya ho rha ki priceFeed ko hum aggreagatorv3interface bana rhe.

        // After refactoring everthing around we now dont need to hard code anything  and thus dont need the below code with us.abi

        // AggregatorV3Interface priceFeed = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );

        (, int256 price, , , ) = priceFeed.latestRoundData();

        return uint256(price * 1e10); // 1**10 = 10000000000

        // So this price coming is the price of eth in terms of usd
    }

    // We dont actually need the get Version.

    // function getVersion() internal view returns (uint256) {
    //     AggregatorV3Interface priceFeeds = AggregatorV3Interface(
    //         0x694AA1769357215DE4FAC081bf1f309aDC325306
    //     );

    //     return priceFeeds.version();
    // }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);

        uint256 ethAmountInUSD = (ethPrice * ethAmount) / 1e18;

        return ethAmountInUSD;
    }
}
