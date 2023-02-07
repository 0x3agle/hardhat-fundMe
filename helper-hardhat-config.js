const networkConfig = {
    5: {
        name: "Goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    137: {
        name: "Polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
}

const devChains = ["hardhat", "localhost"]

const DECIMALS = 8 // Number of zeroes behind the Answer
const INITIAL_ANSWER = 200000000000 // The actual value of ethToUsd with decimals appended 2000_00000000

module.exports = {
    networkConfig,
    devChains,
    DECIMALS,
    INITIAL_ANSWER,
}
