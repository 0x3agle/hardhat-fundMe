const { assert, expect } = require("chai")
const { network, deployments, getNamedAccounts, ethers } = require("hardhat")
const { devChains } = require("../../helper-hardhat-config")

devChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer
          const sendvalue = ethers.utils.parseEther("1")

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendvalue })
              await fundMe.withdraw()
              const endBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endBalance.toString(), "0")
          })
      })
