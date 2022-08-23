import { Contract, providers, Signer } from "ethers"
import TrueFantasySports from "../../public/contracts/TrueFantasySports.sol/TrueFantasySports.json"
import TFSToken from "../../public/contracts/TFSToken.sol/TFSToken.json"
import TrueFantasySportsV1 from "../../public/contracts/TrueFantasySports_V1.sol/TrueFantasySports_V1.json"

const { ethereum } = window

//Created check function to see if the MetaMask extension is installed
export const isMetaMaskInstalled = () => {
    //Have to check the ethereum binding on the window object to see if it's installed

    return Boolean(ethereum && ethereum.isMetaMask)
}

export const getSigner = (_ethereum: any) => {
    const ethersProvider = new providers.Web3Provider(_ethereum)
    return ethersProvider.getSigner()
}

export const getTrueFantasySportContract = (_ethereum: any) => {
    const ethersProvider = new providers.Web3Provider(_ethereum)
    return new Contract(process.env.TFS_PRIVACY_CONTRACT_ADDRESS!, TrueFantasySports.abi, ethersProvider.getSigner())
}

export const getTrueFantasySportV1Contract = (_ethereum: any) => {
    const ethersProvider = new providers.Web3Provider(_ethereum)
    return new Contract(process.env.TFS_V1_CONTRACT_ADDRESS!, TrueFantasySportsV1.abi, ethersProvider.getSigner())
}
export const getTFSTokenContract = (_ethereum: any) => {
    const ethersProvider = new providers.Web3Provider(_ethereum)
    return new Contract(process.env.TFS_TOKEN_CONTRACT_ADDRESS!, TFSToken.abi, ethersProvider.getSigner())
}
