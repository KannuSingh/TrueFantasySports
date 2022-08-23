import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../app/store"

const initialState: string[] = []
export const accountSlice = createSlice({
    name: "eth_accounts",
    initialState,
    reducers: {
        accountsChanged: (state, action: PayloadAction<string[]>) => {
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

export const selectAccounts = (state: RootState) => state.accounts
