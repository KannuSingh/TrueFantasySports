import { run } from "hardhat"
import { MyTeam, calculateMyTeamHash } from "../utils/poseidenUtil"
import { poseidon } from "circomlibjs"
async function main() {
    const { address: verifierAddress } = await run("deploy:verifier", { logs: true })
    const { address: scoreAndTeamVerifierAddress } = await run("deploy:ScoreAndTeamVerifier", { logs: true })

    await run("deploy:truefantasysports", {
        verifierAddress,
        scoreAndTeamVerifierAddress
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

var inputJson = {
    team: [
        [1, 200],
        [1, 150],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [1, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100],
        [0, 100]
    ],
    decimal: 2,
    selectedPlayerIdentifier: 1,
    matchIdentifier: 1,
    secretIdentity: 1
}

//let myTeam: MyTeam = Object.assign({}, inputJson)
//console.log(calculateMyTeamHash(myTeam))
//console.log("Hash of 1,1 : " + poseidon([1, 1]))
