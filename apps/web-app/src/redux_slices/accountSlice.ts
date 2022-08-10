import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../app/store"

const initialState: string[] = []
export const accountSlice = createSlice({
    name: "eth_accounts",
    initialState,
    reducers: {
        accountsChanged: (state, action: PayloadAction<string[]>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            return action.payload
        }
    }
})

export const { accountsChanged } = accountSlice.actions

export default accountSlice.reducer

export const requestAccounts =
    (ethereum: any) => async (dispatch: (arg0: { payload: string[]; type: string }) => void) => {
        try {
            var accounts: string[] = await ethereum.request({
                method: "eth_requestAccounts"
            })

            dispatch(accountsChanged(accounts))
        } catch (err) {
            console.log("accountSlice.js -> requestAccounts : " + err)
        }
    }

export const selectAccount = (state: RootState) => state.accounts
