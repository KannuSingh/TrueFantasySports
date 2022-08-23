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
    isPrivateUser: boolean
    identityString: string
    contests: Contest[]
}
export interface UserPayload {
    isPrivateUser: boolean
    identityString: string
}
export interface UserContestPayload {
    isPrivateUser: boolean
    identityString: string
    contest: Contest
}
const initialState: User[] = []
export const usersSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<UserPayload>) => {
            const users = state.filter(
                (user) =>
                    user.identityString == action.payload.identityString &&
                    user.isPrivateUser == action.payload.isPrivateUser
            )
            if (users.length == 0) {
                return [...state, { ...action.payload, contests: [] }]
            } else {
                return state
            }
        },
        joinContest: (state, action: PayloadAction<UserContestPayload>) => {
            const isPrivateUser = action.payload.isPrivateUser
            const userIdentityString = action.payload.identityString
            const contestToJoin = action.payload.contest
            const users = state.filter(
                (user) => user.identityString == userIdentityString && user.isPrivateUser == isPrivateUser
            )
            //length = 1 signify user is already in the state object
            if (users.length == 1) {
                //check if contestToJoin already exist/joined
                const contestAlreadyExist: boolean =
                    users[0]!.contests.filter((contest) => {
                        contest.matchId == contestToJoin.matchId && contest.contestId == contestToJoin.contestId
                    }).length > 0
                if (contestAlreadyExist) {
                    return state
                } else {
                    users[0]!.contests = [...users[0]!.contests, contestToJoin]
                    return [...state, users[0]!]
                }
            } else {
                return [
                    ...state,
                    { isPrivateUser: isPrivateUser, identityString: userIdentityString, contests: [contestToJoin] }
                ]
            }
        },

        addTeamAndTeamHash: (state, action: PayloadAction<UserContestPayload>) => {
            const isPrivateUser = action.payload.isPrivateUser
            const userIdentityString = action.payload.identityString
            const contestToUpdate = action.payload.contest
            const users = state.filter(
                (user) => user.identityString == userIdentityString && user.isPrivateUser == isPrivateUser
            )
            //length = 1 signify user is already in the state object
            if (users.length == 1) {
                //check if contestToUpdate already exist/joined
                const userContests = users[0]!.contests.map((contest) => {
                    if (contest.matchId == contestToUpdate.matchId && contest.contestId == contestToUpdate.contestId) {
                        contest.team = contestToUpdate.team
                        contest.teamHash = contestToUpdate.teamHash
                        return contest
                    } else {
                        return contest
                    }
                })

                users[0]!.contests = userContests
                return [...state, users[0]!]
            } else {
                return [
                    ...state,
                    { isPrivateUser: isPrivateUser, identityString: userIdentityString, contests: [contestToUpdate] }
                ]
            }
        },
        addTeamScore: (state, action: PayloadAction<UserContestPayload>) => {
            const isPrivateUser = action.payload.isPrivateUser
            const userIdentityString = action.payload.identityString
            const contestToUpdate = action.payload.contest
            const users = state.filter(
                (user) => user.identityString == userIdentityString && user.isPrivateUser == isPrivateUser
            )
            //length = 1 signify user is already in the state object
            if (users.length == 1) {
                //check if contestToUpdate already exist/joined
                const userContests = users[0]!.contests.map((contest) => {
                    if (
                        contest.matchId == contestToUpdate.matchId &&
                        contest.contestId == contestToUpdate.contestId &&
                        contest.team == contestToUpdate.team &&
                        contest.teamHash == contestToUpdate.teamHash
                    ) {
                        contest.teamScore = contestToUpdate.teamScore
                        return contest
                    } else {
                        return contest
                    }
                })

                users[0]!.contests = userContests
                return [...state, users[0]!]
            } else {
                return [
                    ...state,
                    { isPrivateUser: isPrivateUser, identityString: userIdentityString, contests: [contestToUpdate] }
                ]
            }
        }
    }
})
export const { addUser, joinContest, addTeamAndTeamHash, addTeamScore } = usersSlice.actions

export default usersSlice.reducer
export const selectUsersDetails = (state: RootState) => state.usersDetails
//export const selectUserIdentity = (state: RootState) => state.users.identityString
//export const selectContests = (state: RootState) => state.users.contests
