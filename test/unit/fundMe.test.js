const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? 
    describe.skip : 
    describe("FundMe", async function(){

        let fundMe;
        let deployer;
        let mockV3Aggregator;

        // hardcoding the sending value 
        const sendValue = ethers.utils.parseEther("1");

        beforeEach(async function(){
            // deploy our fundme contract using hardhat-deploy

            deployer = (await getNamedAccounts()).deployer;

            await deployments.fixture(["all"]);

            fundMe = await ethers.getContract("FundMe", deployer);

            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);

        })
        
        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async () => {
                const response = await fundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        // all possible test case for the fund function

        describe("fund", async function(){

            // test case when we don't send enough eth
            it("Fails  if you don't send enough ETH", async function(){
                // here we need to call fund function but are we going to do that without passing any parameter/arguments.
                // in doing so it will get an error
                // then we need to use WAFFLE for smooth implementation

                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
            })

            it("Updated the amount funded data structure!", async function(){
                await fundMe.fund({value: sendValue});

                const response = await fundMe.getAddressToAmountFunded(deployer)

                assert.equal(response.toString(), sendValue.toString());
            })

            // test case to check whether funders are added in the array or not.
            it("Add funder to the array of funders", async function(){
                await fundMe.fund({value:sendValue});
                const response = await fundMe.getFunder(0);

                assert.equal(response, deployer);
            })
        })

        // now testing for the withdraw functions
        describe("Withdraw", async function(){
            beforeEach(async function(){
                await fundMe.fund({value: sendValue})
            })

            it("Withdraw ETH from a single funder", async function(){
                //Arrange

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)


                // Act

                const transcationResponse = await fundMe.withdraw();
                const transcationReciept = await transcationResponse.wait(1);

                // pulling out objects from the other objects
                const {gasUsed, effectiveGasPrice} = transcationReciept;

                const gasCost = gasUsed.mul(effectiveGasPrice);


                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)


                // Assert

                assert.equal(endingFundMeBalance, 0)

                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            })

            // when there are multiple funders
            it("Allows us to with th mulitple funders", async function(){

                // Arrange
                const accounts = await ethers.getSigners();

                for(let i =1; i<6; i++){
                    const fundMeConnectedContract = await fundMe.connect(accounts[i]);
                    
                    await fundMeConnectedContract.fund({value: sendValue});
                }

                const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

                const startingDeployerBalance = await fundMe.provider.getBalance(deployer)


                //Act

                const transcationResponse = await fundMe.withdraw();
                const transcationReciept = await transcationResponse.wait(1);

                // pulling out objects from the other objects
                const {gasUsed, effectiveGasPrice} = transcationReciept;

                const gasCost = gasUsed.mul(effectiveGasPrice);

                console.log(`GasCost: ${gasCost}`)
                console.log(`GasUsed: ${gasUsed}`)
                console.log(`GasPrice: ${effectiveGasPrice}`)
                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingDeployerBalance = await fundMe.provider.getBalance(deployer)


                //Assert
                assert.equal(endingFundMeBalance, 0)

                assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

                //make sure that funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for(i=1; i<6; i++){
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0);
                }

            })

            //test case for the only allowed user who is actually the owner to withdraw the things
            it("only allows the owner to withdraw", async function(){
                const accounts = await ethers.getSigners()
                const attacker = accounts[1];

                const attackerConnectedContract = await fundMe.connect(attacker);
                await expect(attackerConnectedContract.withdraw()).to.be.reverted
            })
        })
    })