const networkConfig = {
    11155111: {
        name :"sepolia",
        ethUSDPriceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    5:{
        name:"Georli",
        ethUSDPriceFeedAddress:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    31337: {
        name: "localhost",
    },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8;
const INITIAL_ANSWER = 200;

module.exports={
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}