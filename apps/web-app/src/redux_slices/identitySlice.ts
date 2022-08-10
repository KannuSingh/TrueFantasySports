import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { RootState } from "../app/store"

const initialState: string = ""
export const identitySlice = createSlice({
    name: "identity",
    initialState,
    reducers: {
        changeIdentity: (state, action: PayloadAction<string>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            return action.payload
        }
    }
})
export const { changeIdentity } = identitySlice.actions

export const createIdentity =
    (identity: string) => async (dispatch: (arg0: { payload: string; type: string }) => void) => {
        dispatch(changeIdentity(identity))
    }
export default identitySlice.reducer

export const selectIdentity = (state: RootState) => state.identity
