import { run } from "hardhat"

async function main() {
    const { address: scoreAndTeamVerifierAddress } = await run("deploy:ScoreAndTeamVerifier", { logs: true })
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
