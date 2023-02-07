/* function deployFunc(hre) {
    console.log("Default Function")
}

module.exports.default = deployFunc

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
 }*/

const { networkConfig, devChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //Using these conditions we do not have to hardcode the address
    let ethUsdPriceFeedAddress
    if (devChains.includes(network.name)) {
        //For localhosthost/hardhat network, we have to use mock
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]

    //Deploying FundMe
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        //waitConfirmations: network.config.blockConfirmations || 1,
    })

    //Auto-Verification
    // if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     await verify(fundMe.address, args)
    // }

    log("--------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
