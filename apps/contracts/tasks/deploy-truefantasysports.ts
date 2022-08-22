import { poseidon_gencontract as poseidonContract } from "circomlibjs"
import { task, types } from "hardhat/config"

task("deploy:truefantasysports", "Deploy an True Fantasy Sports contract")
    .addParam<number>("verifierAddress", "Semaphore verifier address", undefined, types.string)
    .addParam<number>("scoreAndTeamVerifierAddress", "ScoreAndTeam Verifier Address  ", undefined, types.string)
    .addOptionalParam<number>("treeDepth", "Merkle tree depth", Number(process.env.TREE_DEPTH) || 20, types.int)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, treeDepth, verifierAddress, scoreAndTeamVerifierAddress }, { ethers }) => {
        const poseidonABI = poseidonContract.generateABI(2)
        const poseidonBytecode = poseidonContract.createCode(2)

        const [signer] = await ethers.getSigners()

        const PoseidonLibFactory = new ethers.ContractFactory(poseidonABI, poseidonBytecode, signer)
        const poseidonLib = await PoseidonLibFactory.deploy()

        await poseidonLib.deployed()

        if (logs) {
            console.info(`Poseidon library has been deployed to: ${poseidonLib.address}`)
        }

        const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
            libraries: {
                PoseidonT3: poseidonLib.address
            }
        })
        const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()

        await incrementalBinaryTreeLib.deployed()

        if (logs) {
            console.info(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`)
        }

        const FactoryContract = await ethers.getContractFactory("TrueFantasySports", {
            libraries: {
                IncrementalBinaryTree: incrementalBinaryTreeLib.address
            }
        })

        const contract = await FactoryContract.deploy(treeDepth, verifierAddress, scoreAndTeamVerifierAddress)

        await contract.deployed()

        if (logs) {
            console.info(`TrueFantasySports contract has been deployed to: ${contract.address}`)
        }

        return contract
    })

task("deploy:truefantasysports_v1", "Deploy an True Fantasy Sports contract Version 1")
    .addParam<number>("scoreAndTeamVerifierAddress", "ScoreAndTeam Verifier Address  ", undefined, types.string)
    .addParam<number>("tfsTokenAddress", "TFS Token Address  ", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, scoreAndTeamVerifierAddress, tfsTokenAddress }, { ethers }) => {
        const [signer] = await ethers.getSigners()

        const FactoryContract = await ethers.getContractFactory("TrueFantasySports_V1", {})

        const contract = await FactoryContract.deploy(scoreAndTeamVerifierAddress, tfsTokenAddress)

        await contract.deployed()

        if (logs) {
            console.info(`TrueFantasySports_V1 contract has been deployed to: ${contract.address}`)
        }

        return contract
    })
