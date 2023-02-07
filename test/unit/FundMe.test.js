const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer, mockV3Aggregator
          const sendvalue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor", async () => {
              it("Sets Aggregator getPriceFeed() addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("Fund", async () => {
              it("Fails if not enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Minimum amount you can send is $50"
                  )
              })
              it("updates the amount s_funded data structure", async () => {
                  await fundMe.fund({ value: sendvalue })
                  const response = await fundMe.getFunded(deployer)
                  assert.equal(response.toString(), sendvalue.toString())
              })
              it("Adds funder to array of s_funders", async () => {
                  await fundMe.fund({ value: sendvalue })
                  const response = await fundMe.getFunders(0)
                  assert.equal(response, deployer)
              })
          })

          describe("Withdraw", async () => {
              //Adding the Funds
              beforeEach(async () => {
                  await fundMe.fund({ value: sendvalue })
              })

              it("Is all money withdrawn", async () => {
                  //Arrange
                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  //Act
                  const txResponse = await fundMe.withdraw()
                  const txReciept = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = txReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //Assert
                  assert.equal(endFundMeBalance, 0)
                  assert.equal(
                      startDeployerBalance.add(startFundMeBalance).toString(),
                      endDeployerBalance.add(gasCost).toString()
                  )
              })

              it("is allows us to withdraw with multiple s_funders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendvalue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  // Let's comapre gas costs :)
                  // const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const GasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(GasCost).toString()
                  )
                  //Array is reset
                  await expect(fundMe.getFunders(0)).to.be.reverted
              })

              it("Allows only owner to withdraw", async () => {
                  const attacker = await ethers.getSigners()
                  const attackerConnectedContract = await fundMe.connect(
                      attacker[1]
                  )
                  await expect(attackerConnectedContract.withdraw()).to.be
                      .reverted
              })

              it("Cheaper Withdraw testing....", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendvalue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  // Let's comapre gas costs :)
                  // const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const GasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(GasCost).toString()
                  )
                  //Array is reset
                  await expect(fundMe.getFunders(0)).to.be.reverted
              })
          })
      })
