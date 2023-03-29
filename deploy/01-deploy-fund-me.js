// async function deployFunc(hre){
//      console.log("Hi!")
//      hre.getNamedAccounts();
//      hre.deployments();
//    }
//  module.exports.default = deployFunc



// identical without naming the function.
// using anonymous function here

// module.exports = async (hre)=>{
//     const {getNamedAccount, deployments}= hre;
// }


//another way of writing the above code without using the two lines

// importing network config from the helper-hardhat-config
/* Other way of importing the network config

const helperConfig = require("../helper-hardhat-config")
const networkConfig = helperConfig.networkConfig

*/

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const {network} = require("hardhat")
const {verify} = require("../utils/verfiy");
require("dotenv").config()

module.exports = async ({getNamedAccounts, deployments})=>{

    // grabbing DEPLOY  and LOG functions from deployments
    // grabbing DEPLOYER ACCOUNT from the getNamedAccounts

    const {deploy, log} = deployments;

    const {deployer} = await getNamedAccounts();

    // also grab CHAINID from the network.config

    const chainId = network.config.chainId;

    // WHEN GOING FOR LOCALHOST OR HARDHAT NETWORK WE WNAT TO USE A MOCK!
    // ==> IF THE CONTRACT DOESN'T EXIST, WE DEPLOY A MINIMAL VERSION FOR OUR LOCAL TESTING.

    //Getting the address of the priceFeed using the networkConfig we just created in helper-hardhat-config.js
    // now instead of using ethUsdpricesaddress as a constatn. we are going to use as let.
    let ethUSDPriceFeedAddress; //= networkConfig[chainId]["ethUSDPriceFeedAddress"];

    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUSDPriceFeedAddress = ethUsdAggregator.address;
    }else{
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUSDPriceFeedAddress"];
    }

    //main deployment but this time we donot need a contractFactory.
    const args= [ethUSDPriceFeedAddress];
    const fundMe = await deploy("FundMe",{
        from : deployer,
        args:args,    // putting the priceFeed Address here.
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })


    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){

        await verify(fundMe.address, args)

    }

    log("-------------------------------------------------------------------------------");

}

module.exports.tags= ["all","fundme"];
