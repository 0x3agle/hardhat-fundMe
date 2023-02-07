const { network } = require("hardhat")
const {
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    //Checking if it is a local network and then deloying mocks
    if (devChains.includes(network.name)) {
        log("Local network detected! Deploying Mocks..")
        await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], //Refer to helper-hardhat
        })
        log("Mocks Deployed!")
        log("------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
