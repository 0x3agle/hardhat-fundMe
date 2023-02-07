const { run } = require("hardhat")
async function verify(contractAddress, args) {
    console.log("Verifying Contract...")
    try {
        //running the hardhat command "run"
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("verified")) {
            console.log("Already Verified")
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }
