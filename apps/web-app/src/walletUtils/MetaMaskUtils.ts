import { Contract, providers, Signer } from "ethers"
import TrueFantasySports from "../../public/contracts/TrueFantasySports.sol/TrueFantasySports.json"
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
    return new Contract(process.env.CONTRACT_ADDRESS!, TrueFantasySports.abi, ethersProvider.getSigner())
}
