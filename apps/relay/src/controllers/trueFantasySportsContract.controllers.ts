import express from "express"
import { Contract, providers, utils, Wallet } from "ethers"
import { abi as contractAbi } from "../../public/contracts/TrueFantasySports.sol/TrueFantasySports.json"
import { config as dotenvConfig } from "dotenv"
import { resolve } from "path"

dotenvConfig({ path: resolve(__dirname, "./../../../../../.env") })
const ethereumURL = process.env.ETHEREUM_URL
const contractAddress = process.env.TFS_PRIVACY_CONTRACT_ADDRESS
const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
const provider = new providers.JsonRpcProvider(ethereumURL)
const signer = new Wallet(ethereumPrivateKey!, provider)
const contract = new Contract(contractAddress!, contractAbi, signer)

const applicationName = (_req: express.Request, _res: express.Response) => {
    try {
        _res.setHeader("Content-Type", "application/json")
        _res.status(200).end(JSON.stringify({ app_name: "TRUE FANTASY SPORTS RELAY NODE" }))
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const createContest = async (_req: express.Request, _res: express.Response) => {
    console.log("Request : Create Contest ")
    const { contestName, identityCommitment, contestCompletionTime, contestEntryFee, teamSubmissionDeadline, matchId } =
        _req.body
    console.log("Contest name : " + contestName)
    console.log("Identity Commitment : " + identityCommitment)
    console.log("Contest Completion Time : " + contestCompletionTime)
    console.log("ContestEntryFee : " + contestEntryFee)
    console.log("TeamSubmissionDeadline : " + teamSubmissionDeadline)
    console.log("MatchId: " + matchId)
    try {
        const transaction = await contract.createContest(
            contestName,
            matchId,
            teamSubmissionDeadline,
            contestCompletionTime,
            contestEntryFee,
            identityCommitment
        )

        await transaction.wait()
        console.log("Success create-contest request")
        const contests = await contract.queryFilter(contract.filters.ContestCreated())
        console.log(contests)
        console.log("Body : " + _req.body)
        _res.status(200).end()
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const addMember = async (_req: express.Request, _res: express.Response) => {
    console.log("Request : Add Member ")
    const { contestId, identityCommitment } = _req.body
    console.log("Contest ID : " + contestId)
    console.log("Identity Commitment : " + identityCommitment)
    try {
        const transaction = await contract.addMember(contestId, identityCommitment)

        await transaction.wait()
        console.log("Added member : " + identityCommitment)
        _res.status(200).end()
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const postTeam = async (_req: express.Request, _res: express.Response) => {
    console.log("Request : Post team ")
    const { teamId, teamHash, nullifierHash, contestId, solidityProof } = _req.body
    console.log("Contest Id : " + contestId)
    try {
        const transaction = await contract.postTeam(teamId, teamHash, nullifierHash, contestId, solidityProof)

        await transaction.wait()
        console.log("Success post-team request")
        const teamPosted = await contract.queryFilter(contract.filters.TeamPosted())
        console.log(teamPosted)

        _res.status(200).end()
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const updateTeam = async (_req: express.Request, _res: express.Response) => {
    const { teamId, teamHash, initialNullifierHash, proofNullifierHash, contestId, solidityProof } = _req.body

    try {
        const transaction = await contract.updateTeam(
            utils.formatBytes32String(teamId),
            teamHash,
            initialNullifierHash,
            proofNullifierHash,
            contestId,
            solidityProof
        )

        await transaction.wait()

        _res.status(200).end()
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const submitScore = async (_req: express.Request, _res: express.Response) => {
    console.log("Request : Submit Score ")
    const {
        teamId,
        teamHash,
        initialNullifierHash,
        nullifierHash,
        contestId,
        semaphoreSolidityProof,
        teamAndScoreInputArray,
        tfsProof
    } = _req.body
    console.log("Contest Id : " + contestId)

    console.log(JSON.stringify(_req.body))
    try {
        const transaction = await contract.submitTeamScore(
            teamId,
            initialNullifierHash,
            nullifierHash,
            contestId,
            semaphoreSolidityProof,
            teamAndScoreInputArray[0], //_score,
            teamAndScoreInputArray[1], //teamPoseidenHash,
            teamAndScoreInputArray[2], //_playersScorecard[30],
            tfsProof //array[8]
        )

        await transaction.wait()
        console.log("Success submitted score and Team request")
        const teamScore = await contract.queryFilter(
            contract.filters.TeamScore(contestId, teamAndScoreInputArray[1] /**team hash */)
        )
        console.log(teamScore)

        _res.status(200).end()
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

export = {
    applicationName,
    createContest,
    addMember,
    postTeam,
    updateTeam,
    submitScore
}
