import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Identity } from "@semaphore-protocol/identity"
import { ethers, Signer } from "ethers"

import { RootState } from "../app/store"
import { MyTeam } from "../utils/MyTeam"

export interface Contest {
    matchId: string
    contestId: string
    contestFee?: number
    contestName?: string
    team?: MyTeam
    teamHash?: string
    teamScore?: string
}
export interface User {
    identityString: string

    contests: Contest[]
}
const initialState: User = {
    identityString: "",
    contests: []
}
export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        changeUserIdentity: (state, action: PayloadAction<string>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.identityString = action.payload
        },
        addContest: (state, action: PayloadAction<Contest>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            let contest: Contest = {
                matchId: action.payload.matchId,
                contestId: action.payload.contestId
            }
            state.contests = [...state.contests, contest]
        },

        addTeamAndTeamHash: (state, action: PayloadAction<Contest>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            if (state.contests.length > 0) {
                state.contests.map((contest) => {
                    if (contest.contestId == action.payload.contestId) {
                        contest.team = action.payload.team
                        contest.teamHash = action.payload.teamHash
                        return contest
                    } else {
                        return contest
                    }
                })
            } else {
                state.contests.push(action.payload)
            }
        },
        addTeamScore: (state, action: PayloadAction<Contest>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            state.contests.map((contest) => {
                if (contest.contestId == action.payload.contestId && contest.teamHash == action.payload.teamHash) {
                    contest.teamScore = action.payload.teamScore
                    return contest
                } else {
                    return contest
                }
            })
        }
    }
})
export const { changeUserIdentity, addContest, addTeamAndTeamHash, addTeamScore } = userSlice.actions

export default userSlice.reducer

export const selectUserIdentity = (state: RootState) => state.user.identityString
export const selectContests = (state: RootState) => state.user.contests
