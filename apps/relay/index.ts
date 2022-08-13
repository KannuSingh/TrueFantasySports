import cors from "cors"
import { config as dotenvConfig } from "dotenv"
import { Contract, providers, utils, Wallet } from "ethers"
import express from "express"
import { resolve } from "path"
const path = require("path")

import { abi as contractAbi } from "public/contracts/TrueFantasySports.sol/TrueFantasySports.json"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

if (typeof process.env.CONTRACT_ADDRESS !== "string") {
    throw new Error("Please, define CONTRACT_ADDRESS in your .env file")
}

if (typeof process.env.ETHEREUM_URL !== "string") {
    throw new Error("Please, define ETHEREUM_URL in your .env file")
}

if (typeof process.env.ETHEREUM_PRIVATE_KEY !== "string") {
    throw new Error("Please, define ETHEREUM_PRIVATE_KEY in your .env file")
}

if (typeof process.env.RELAY_URL !== "string") {
    throw new Error("Please, define RELAY_URL in your .env file")
}

const ethereumPrivateKey = process.env.ETHEREUM_PRIVATE_KEY
const ethereumURL = process.env.ETHEREUM_URL
const contractAddress = process.env.CONTRACT_ADDRESS
const { port } = new URL(process.env.RELAY_URL)

const app = express()

app.use(cors())
app.use(express.json())

const provider = new providers.JsonRpcProvider(ethereumURL)
const signer = new Wallet(ethereumPrivateKey, provider)
const contract = new Contract(contractAddress, contractAbi, signer)

app.post("/update-team", async (req, res) => {
    const { teamId, teamHash, initialNullifierHash, proofNullifierHash, contestId, solidityProof } = req.body

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

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
})

app.post("/post-team", async (req, res) => {
    console.log("Request : Post team ")
    const { teamId, teamHash, nullifierHash, contestId, solidityProof } = req.body
    console.log("Contest Id : " + contestId)
    try {
        const transaction = await contract.postTeam(teamId, teamHash, nullifierHash, contestId, solidityProof)

        await transaction.wait()
        console.log("Success post-team request")
        const teamPosted = await contract.queryFilter(contract.filters.TeamPosted())
        console.log(teamPosted)

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
})
app.post("/submit-score", async (req, res) => {
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
    } = req.body
    console.log("Contest Id : " + contestId)

    console.log(JSON.stringify(req.body))
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

        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
})

app.post("/add-member", async (req, res) => {
    console.log("Request : Add Member ")
    const { contestId, identityCommitment } = req.body
    console.log("Contest ID : " + contestId)
    console.log("Identity Commitment : " + identityCommitment)
    try {
        const transaction = await contract.addMember(contestId, identityCommitment)

        await transaction.wait()
        console.log("Added member : " + identityCommitment)
        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
})

app.post("/create-contest", async (req, res) => {
    console.log("Request : Create Contest ")
    const { contestName, identityCommitment, contestCompletionTime, contestEntryFee, teamSubmissionDeadline, matchId } =
        req.body
    console.log("Contest name : " + contestName)
    console.log("Identity Commitment : " + identityCommitment)
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
        console.log("Body : " + req.body)
        res.status(200).end()
    } catch (error: any) {
        console.error(error)

        res.status(500).end()
    }
})
//route to download a file
app.get("/download/:file(*)", (req, res) => {
    var file = req.params.file
    var fileLocation = path.join("./uploads", file)
    console.log(fileLocation)
    res.download(fileLocation, file)
})

app.listen(port, () => {
    console.info(`Started HTTP relay API at ${process.env.RELAY_URL}/`)
})
