import { run } from "hardhat"
async function main() {
    const { address: verifierAddress } = await run("deploy:verifier", { logs: true })
    const { address: scoreAndTeamVerifierAddress } = await run("deploy:ScoreAndTeamVerifier", { logs: true })

    await run("deploy:truefantasysports", {
        verifierAddress,
        scoreAndTeamVerifierAddress
    })
    const { address: tfsTokenAddress } = await run("deploy:TFSToken", { logs: true })
    await run("deploy:truefantasysports_v1", {
        scoreAndTeamVerifierAddress,
        tfsTokenAddress
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
