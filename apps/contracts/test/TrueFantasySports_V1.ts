import { Identity } from "@semaphore-protocol/identity"
import { createMerkleTree, generateNullifierHash, generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { expect } from "chai"
import { utils } from "ethers"
import { time } from "@nomicfoundation/hardhat-network-helpers"
import { formatBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { ethers, run } from "hardhat"
import { TrueFantasySports_V1 as TrueFantasySports_V1_Contract } from "../build/typechain"
import { config } from "../package.json"
const fs = require("fs")

describe("TFS_V1 Test", async () => {
    let contract: TrueFantasySports_V1_Contract

    const contestName = formatBytes32String("Contest1")
    const contestGroupId = BigInt(solidityKeccak256(["bytes32"], [contestName])) >> BigInt(8)
    const entryFee = BigInt(2500)
    const matchId = BigInt(1)

    const TEN_HOUR_IN_SECS = 10 * 60 * 60
    const ONE_DAY_IN_SECS = 24 * 60 * 60

    const scoreAndTeamWasmFilePath = `${config.paths.build["snark-artifacts"]}/ScoreAndTeam.wasm`
    const scoreAndTeamZkeyFilePath = `${config.paths.build["snark-artifacts"]}/ScoreAndTeam.zkey`
    before(async () => {
        const { address: scoreAndTeamVerifierAddress } = await run("deploy:ScoreAndTeamVerifier", { logs: true })

        contract = await run("deploy:truefantasysports_v1", {
            scoreAndTeamVerifierAddress
        })
        console.log("here")
    })

    describe("# createContest", () => {
        it("Should create an contest", async () => {
            const _teamSubmissionEndTime = (await time.latest()) + TEN_HOUR_IN_SECS
            const _contestCompletionEndTime = (await time.latest()) + ONE_DAY_IN_SECS
            const transaction = contract.createContest(
                contestName,
                matchId,
                _teamSubmissionEndTime,
                _contestCompletionEndTime,
                entryFee
            )

            await expect(transaction)
                .to.emit(contract, "ContestCreated")
                .withArgs(
                    contestGroupId,
                    contestName,
                    matchId,
                    entryFee,
                    _teamSubmissionEndTime,
                    _contestCompletionEndTime
                )
        })
    })

    /*  
  describe("# addMember", () => {
        it("Should add a member to an existing event", async () => {
            const transaction = contract.addMember(contestGroupId, participantIdentityCommitment)
            console.log(contestGroupId + "   --   " + participantIdentityCommitment)
            await expect(transaction)
                .to.emit(contract, "MemberAdded")
                .withArgs(contestGroupId, participantIdentityCommitment, tree.root)
        })
    })
*/

    describe("# postTeam", () => {
        it("Should post a review anonymously", async () => {
            const teamPoseidenHash = "18048802137424278975303082895928334852053295316234241862967677369271245544361"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            const transaction = contract.postTeam(teamHash, contestGroupId)
            const [owner] = await ethers.getSigners()
            await expect(transaction).to.emit(contract, "TeamPosted").withArgs(contestGroupId, owner.address, teamHash)
        })
    })
    describe("# postTeam Again", () => {
        it("Should post a review anonymously", async () => {
            const teamPoseidenHash = "18048802137424278975303082895928334852053295316234241862967677369271245544361"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash

            const transaction = contract.postTeam(teamHash, contestGroupId)
            const [owner] = await ethers.getSigners()
            await expect(transaction).to.emit(contract, "TeamPosted").withArgs(contestGroupId, owner.address, teamHash)
        })
    })

    describe("# updateTeam", () => {
        it("Should update a team anonymously", async () => {
            const teamPoseidenHash = "1162119754818368460199409572619983175846599066197319715098135733401866990053"

            const teamHash = utils.solidityKeccak256(["uint256"], [teamPoseidenHash])

            const transaction = contract.updateTeam(teamHash, contestGroupId)
            const [owner] = await ethers.getSigners()
            await expect(transaction).to.emit(contract, "TeamUpdated").withArgs(contestGroupId, owner.address, teamHash)
        })
    })

    describe("# submitScore", () => {
        it("Should submit a team score anonymously", async () => {
            const teamPoseidenHash = "1162119754818368460199409572619983175846599066197319715098135733401866990053"

            const _score = "0x2ffd7f22157e513c10ab45da6975508d5476adf006b9bf7240ee957265d3fa9c"
            const _playersScorecard = [
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
                "0x0000000000000000000000000000000000000000000000000000000000000014"
            ]

            for (var i = 0; i < 16; i++) {
                var array = JSON.parse(fs.readFileSync(`${config.paths.build["snark-artifacts"]}/parameters.txt`))
            }

            const transaction = contract.submitTeamScore(
                contestGroupId,
                _score,
                teamPoseidenHash,
                _playersScorecard,
                array
            )

            await expect(transaction).to.emit(contract, "TeamScore").withArgs(contestGroupId, teamPoseidenHash, _score)
        })
    })
})
