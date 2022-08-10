import { poseidon } from "circomlibjs"
import { MyTeam } from "./MyTeam"
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
function poseidonTree(noOfLeafs: number, input: number[]): number {
    var _poseidon = new Array(Math.round(noOfLeafs / 7))

    var index = 0
    for (var i = 0; i < noOfLeafs; i = i + 8) {
        console.log("Index " + index + " : " + input.slice(i, i + 8))
        _poseidon[index] = poseidon(input.slice(i, i + 8))
        console.log(" : " + _poseidon[index])
        index++
    }

    for (var level = 2; noOfLeafs >> (level * 3) > 0; level++) {
        for (var i = 0; i < noOfLeafs >> (level * 3); i++) {
            var internalNodes = new Array(8)
            for (var j = 0; j < 8; j++) {
                //hard coding or level 2
                internalNodes[j] = _poseidon[index - (noOfLeafs >> ((level - 1) * 3)) + i + j]
                // poseidon[idx].inputs[j] <== poseidon[idx-(nLeafs>>((level-1)*2))+i+j].out;
            }
            _poseidon[index] = poseidon(internalNodes)
            console.log("Index " + index + " : " + _poseidon[index])
            index++
        }
    }
    console.log("Calculated Hash : " + _poseidon[index - 1])
    return _poseidon[index - 1]
}

function calculateMyTeamHash(myTeam: MyTeam): number {
    console.log("Started")
    var outputHash: number = -1
    if (myTeam.team.length == 30) {
        var inputData: number[] = new Array(60)
        let team = myTeam.team
        for (var i = 0; i < 30; i++) {
            //console.log(i)
            inputData[i * 2] = team[i][0]
            inputData[i * 2 + 1] = team[i][1]
        }
        inputData.push(myTeam.decimal)
        inputData.push(myTeam.selectedPlayerIdentifier)
        inputData.push(myTeam.matchIdentifier)
        inputData.push(myTeam.secretIdentity)

        outputHash = poseidonTree(64, inputData)
    } else {
        console.log("Error hashing Team : Team don't have 30 players")
    }
    //-1 signify error
    return outputHash
}

export { calculateMyTeamHash }
export { MyTeam }
let myTeam: MyTeam = Object.assign({}, inputJson)

//calculateMyTeamHash(myTeam)
