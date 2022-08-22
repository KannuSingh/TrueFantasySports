import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-dependency-compiler"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import { resolve } from "path"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/accounts"
import "./tasks/deploy-events"
import "./tasks/deploy-verifier"
import "./tasks/deploy-truefantasysports"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

function getNetworks(): NetworksUserConfig {
    if (process.env.INFURA_API_KEY && process.env.ETHEREUM_PRIVATE_KEY) {
        const infuraApiKey = process.env.INFURA_API_KEY
        const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]

        return {
            goerli: {
                url: `https://goerli.infura.io/v3/${infuraApiKey}`,
                chainId: 5,
                accounts
            },
            rinkeby: {
                url: `https://rinkeby.infura.io/v3/${infuraApiKey}`,
                chainId: 4,
                accounts
            },
            kovan: {
                url: `https://kovan.infura.io/v3/${infuraApiKey}`,
                chainId: 42,
                accounts
            },
            arbitrum: {
                url: "https://arb1.arbitrum.io/rpc",
                chainId: 42161,
                accounts
            },
            metis: {
                url: "https://stardust.metis.io/?owner=588",
                //chainId: 42161,
                accounts
            },
            polygon: {
                url: `https://polygon-mumbai.g.alchemy.com/v2/${infuraApiKey}`,
                chainId: 80001,
                accounts
            }
        }
    }

    return {}
}

const hardhatConfig: HardhatUserConfig = {
    solidity: config.solidity,
    paths: {
        sources: config.paths.contracts,
        tests: config.paths.tests,
        cache: config.paths.cache,
        artifacts: config.paths.build.contracts
    },
    dependencyCompiler: {
        paths: ["@semaphore-protocol/contracts/verifiers/Verifier20.sol"]
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        ...getNetworks()
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        outDir: config.paths.build.typechain,
        target: "ethers-v5"
    }
}

export default hardhatConfig
