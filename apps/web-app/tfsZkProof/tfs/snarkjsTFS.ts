import { exportCallDataGroth16 } from "../snarkjsZkproof"

export async function scoreAndTeamCalldata(
    playersScoreInMatch: number[],

    matchIdentifier: bigint,
    decimal: bigint,
    selectedPlayerIdentifier: bigint,
    secretIdentity: bigint,
    team: any[][]
) {
    const input = {
        playersScoreInMatch: playersScoreInMatch,

        matchIdentifier: matchIdentifier,
        decimal: decimal,
        selectedPlayerIdentifier: selectedPlayerIdentifier,
        secretIdentity: secretIdentity,
        team: team
    }

    let dataResult

    try {
        dataResult = await exportCallDataGroth16(
            input,
            "http://localhost:3000/download/ScoreAndTeam.wasm",
            "http://localhost:3000/download/ScoreAndTeam_final.zkey"
        )
    } catch (error) {
        console.log(error)
        window.alert("Wrong answer")
    }

    return dataResult
}
