import { Identity } from "@semaphore-protocol/identity"
import { createMerkleTree, generateNullifierHash, generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { utils } from "ethers"
import { time } from "@nomicfoundation/hardhat-network-helpers"
import { formatBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { run } from "hardhat"
import { TrueFantasySports as TrueFantasySportsContract } from "../build/typechain"
import { config } from "../package.json"
const fs = require("fs")

describe("TFS Contest", async () => {
    let contract: TrueFantasySportsContract

    const treeDepth = Number(process.env.TREE_DEPTH)
    const contestName = formatBytes32String("Contest1")
    const contestGroupId = BigInt(solidityKeccak256(["bytes32"], [contestName])) >> BigInt(8)
    const entryFee = BigInt(2500)
    const matchId = BigInt(1)
    const participantIdentity = new Identity()
    const participantIdentityCommitment = participantIdentity.generateCommitment()
    const tree = createMerkleTree(treeDepth, BigInt(0), [participantIdentityCommitment])
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
    const _teamSubmissionEndTime = (await time.latest()) + ONE_YEAR_IN_SECS
    const semaphoreWasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const semaphoreZkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`
    const scoreAndTeamWasmFilePath = `${config.paths.build["snark-artifacts"]}/ScoreAndTeam.wasm`
    const scoreAndTeamZkeyFilePath = `${config.paths.build["snark-artifacts"]}/ScoreAndTeam.zkey`

    const { address: verifierAddress } = await run("deploy:verifier", {
        logs: true
    })
    const { address: scoreAndTeamVerifierAddress } = await run("deploy:ScoreAndTeamVerifier", { logs: true })

    contract = await run("deploy:truefantasysports", {
        logs: true,
        verifierAddress,
        scoreAndTeamVerifierAddress
    })

    describe("# createContest", () => {
        it("Should create an contest", async () => {
            const transaction = contract.createContest(
                contestName,
                matchId,
                _teamSubmissionEndTime,
                entryFee,
                participantIdentityCommitment
            )
            console.log(contestGroupId + "   --   " + participantIdentityCommitment)
            await expect(transaction)
                .to.emit(contract, "ContestCreated")
                .withArgs(contestGroupId, contestName, matchId, entryFee)
        })
    })

    describe("# addMember", () => {
        it("Should add a member to an existing event", async () => {
            const transaction = contract.addMember(contestGroupId, participantIdentityCommitment)
            console.log(contestGroupId + "   --   " + participantIdentityCommitment)
            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(contestGroupId, participantIdentityCommitment, tree.root)
        })
    })

    describe("# postTeam", () => {
        it("Should post a review anonymously", async () => {
            const teamPoseidenHash = "7169025707812541800452842385832230666471027425029365431941267906526734580222"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = teamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const merkleProof = tree.createProof(0)

            const fullProof = await generateProof(participantIdentity, merkleProof, contestGroupId, teamIdentifier, {
                wasmFilePath: semaphoreWasmFilePath,
                zkeyFilePath: semaphoreZkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = contract.postTeam(
                bytes32TeamIdentifier,
                teamHash,
                fullProof.publicSignals.nullifierHash,
                contestGroupId,
                solidityProof
            )
            console.log("Nullifier hash :" + fullProof.publicSignals.nullifierHash)
            await expect(transaction).to.emit(contract, "TeamPosted").withArgs(contestGroupId, bytes32TeamIdentifier)

            console.log(utils.toUtf8Bytes(teamIdentifier))
            console.log(teamIdentifier)
            console.log(utils.isHexString(teamHash))
            console.log(utils.arrayify(teamHash))
            console.log(utils.hexlify(teamHash))
            // slice (2) at the end removes 0x prefix from keccak256 hash
        })
    })
    describe("# postTeam Again", () => {
        it("Should post a review anonymously", async () => {
            const teamPoseidenHash = "18048802137424278975303082895928334852053295316234241862967677369271245544361"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = teamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const merkleProof = tree.createProof(0)

            const fullProof = await generateProof(participantIdentity, merkleProof, contestGroupId, teamIdentifier, {
                wasmFilePath: semaphoreWasmFilePath,
                zkeyFilePath: semaphoreZkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = contract.postTeam(
                bytes32TeamIdentifier,
                teamHash,
                fullProof.publicSignals.nullifierHash,
                contestGroupId,
                solidityProof
            )

            await expect(transaction).to.emit(contract, "TeamPosted").withArgs(contestGroupId, bytes32TeamIdentifier)

            // slice (2) at the end removes 0x prefix from keccak256 hash
        })
    })

    describe("# updateTeam", () => {
        it("Should update a team anonymously", async () => {
            const teamPoseidenHash = "7169025707812541800452842385832230666471027425029365431941267906526734580222"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = teamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const merkleProof = tree.createProof(0)
            const updateTeamCount = 1
            const externalNullifier =
                BigInt(solidityKeccak256(["uint256", "uint32"], [contestGroupId, updateTeamCount])) >> BigInt(8)
            const initialNullifierHash = await generateNullifierHash(contestGroupId, participantIdentity.getNullifier())
            const fullProof = await generateProof(participantIdentity, merkleProof, externalNullifier, teamIdentifier, {
                wasmFilePath: semaphoreWasmFilePath,
                zkeyFilePath: semaphoreZkeyFilePath
            })
            const solidityProof = packToSolidityProof(fullProof.proof)

            const transaction = contract.updateTeam(
                bytes32TeamIdentifier,
                teamHash,
                initialNullifierHash,
                fullProof.publicSignals.nullifierHash,
                contestGroupId,

                solidityProof
            )

            await expect(transaction).to.emit(contract, "TeamPosted").withArgs(contestGroupId, bytes32TeamIdentifier)
        })
    })

    describe("# submitScore", () => {
        it("Should submit a team score anonymously", async () => {
            const teamPoseidenHash = "7169025707812541800452842385832230666471027425029365431941267906526734580222"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = teamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const merkleProof = tree.createProof(0)
            const updateTeamCount = 2
            const externalNullifier =
                BigInt(solidityKeccak256(["uint256", "uint32"], [contestGroupId, updateTeamCount])) >> BigInt(8)
            const initialNullifierHash = await generateNullifierHash(contestGroupId, participantIdentity.getNullifier())
            const fullProof = await generateProof(participantIdentity, merkleProof, externalNullifier, teamIdentifier, {
                wasmFilePath: semaphoreWasmFilePath,
                zkeyFilePath: semaphoreZkeyFilePath
            })
            const semaphoreSolidityProof = packToSolidityProof(fullProof.proof)
            const _score = "0x0238dc98d4c819732307967068fa0bda9a2e9fa6ba71dde86574e4af970cd0fa"
            const _playersScorecard = [
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000002",
                "0x0000000000000000000000000000000000000000000000000000000000000003",
                "0x0000000000000000000000000000000000000000000000000000000000000004",
                "0x0000000000000000000000000000000000000000000000000000000000000005",
                "0x0000000000000000000000000000000000000000000000000000000000000006",
                "0x0000000000000000000000000000000000000000000000000000000000000007",
                "0x0000000000000000000000000000000000000000000000000000000000000008",
                "0x0000000000000000000000000000000000000000000000000000000000000009",
                "0x000000000000000000000000000000000000000000000000000000000000000a",
                "0x000000000000000000000000000000000000000000000000000000000000000b",
                "0x000000000000000000000000000000000000000000000000000000000000000c",
                "0x000000000000000000000000000000000000000000000000000000000000000d",
                "0x000000000000000000000000000000000000000000000000000000000000000e",
                "0x000000000000000000000000000000000000000000000000000000000000000f",
                "0x0000000000000000000000000000000000000000000000000000000000000010",
                "0x0000000000000000000000000000000000000000000000000000000000000011",
                "0x0000000000000000000000000000000000000000000000000000000000000012",
                "0x0000000000000000000000000000000000000000000000000000000000000013",
                "0x0000000000000000000000000000000000000000000000000000000000000014",
                "0x0000000000000000000000000000000000000000000000000000000000000015",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000002",
                "0x0000000000000000000000000000000000000000000000000000000000000003",
                "0x0000000000000000000000000000000000000000000000000000000000000004",
                "0x0000000000000000000000000000000000000000000000000000000000000005",
                "0x0000000000000000000000000000000000000000000000000000000000000006",
                "0x0000000000000000000000000000000000000000000000000000000000000007"
            ]

            for (var i = 0; i < 16; i++) {
                var array = JSON.parse(fs.readFileSync(`${config.paths.build["snark-artifacts"]}/parameters.txt`))
            }

            /*    const _scoreAndTeamProof = [
                [
                    "0x0238dc98d4c819732307967068fa0bda9a2e9fa6ba71dde86574e4af970cd0fa",
                    "0x07a0964fde4d3c2b77994104f89538398bdf7f6a7e31c50d8498a2e99ffc4f5c"
                ],
                [
                    [
                        "0x1f53ce022e0b43f5be9241ebf545b4f38720e3325198c3aa953e649ca8c60d03",
                        "0x28bfdab444971d72072d581f126def720dccbd6b462a882dbb3ec292d3215a51"
                    ],
                    [
                        "0x22b7e8d8923cdae4d95bfa69d5ffbcb9eb037bf3eebd81b76106b39f7ef7b3aa",
                        "0x2890bd56b338822efb2cf607e03e9276b3d2b48aaca44f03a00ddc5cd7c13dcd"
                    ]
                ],
                [
                    "0x0b515cb7b747f207cbedbc45e9cd4c0a44ea13af811ba5063273b9fb3f46c598",
                    "0x22bfc54247fe9e3d20c8e2f9c2ca13f0d579956ce02a9d078b93f3ef8257c4bd"
                ],
                [
                    "0x000000000000000000000000000000000000000000000000000000000000003f",
                    "0x0fd986567fa0a94a92aa913b6d195b6ac8f7da9de2a3808a751fbf283df9f9fe",
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000000000000000000000000001",
                    "0x0000000000000000000000000000000000000000000000000000000000000002",
                    "0x0000000000000000000000000000000000000000000000000000000000000003",
                    "0x0000000000000000000000000000000000000000000000000000000000000004",
                    "0x0000000000000000000000000000000000000000000000000000000000000005",
                    "0x0000000000000000000000000000000000000000000000000000000000000006",
                    "0x0000000000000000000000000000000000000000000000000000000000000007",
                    "0x0000000000000000000000000000000000000000000000000000000000000008",
                    "0x0000000000000000000000000000000000000000000000000000000000000009",
                    "0x000000000000000000000000000000000000000000000000000000000000000a",
                    "0x000000000000000000000000000000000000000000000000000000000000000b",
                    "0x000000000000000000000000000000000000000000000000000000000000000c",
                    "0x000000000000000000000000000000000000000000000000000000000000000d",
                    "0x000000000000000000000000000000000000000000000000000000000000000e",
                    "0x000000000000000000000000000000000000000000000000000000000000000f",
                    "0x0000000000000000000000000000000000000000000000000000000000000010",
                    "0x0000000000000000000000000000000000000000000000000000000000000011",
                    "0x0000000000000000000000000000000000000000000000000000000000000012",
                    "0x0000000000000000000000000000000000000000000000000000000000000013",
                    "0x0000000000000000000000000000000000000000000000000000000000000014",
                    "0x0000000000000000000000000000000000000000000000000000000000000015",
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000000000000000000000000001",
                    "0x0000000000000000000000000000000000000000000000000000000000000002",
                    "0x0000000000000000000000000000000000000000000000000000000000000003",
                    "0x0000000000000000000000000000000000000000000000000000000000000004",
                    "0x0000000000000000000000000000000000000000000000000000000000000005",
                    "0x0000000000000000000000000000000000000000000000000000000000000006",
                    "0x0000000000000000000000000000000000000000000000000000000000000007"
                ]
           ]
*/
            const transaction = contract.submitTeamScore(
                bytes32TeamIdentifier,
                initialNullifierHash,
                fullProof.publicSignals.nullifierHash,
                contestGroupId,
                semaphoreSolidityProof,
                _score,
                teamPoseidenHash,
                _playersScorecard,
                array
            )

            await expect(transaction).to.emit(contract, "TeamScore").withArgs(contestGroupId, teamPoseidenHash, _score)
        })
    })
})
