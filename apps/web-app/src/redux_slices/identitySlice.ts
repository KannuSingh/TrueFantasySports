import { createSlice, PayloadAction } from "@reduxjs/toolkit"

import { RootState } from "../app/store"

const initialState: string = ""
export const identitySlice = createSlice({
    name: "identity",
    initialState,
    reducers: {
        setCurrentIdentity: (state, action: PayloadAction<string>) => {
            return action.payload
        }
    }
})
export const { setCurrentIdentity } = identitySlice.actions

export default identitySlice.reducer

export const selectCurrentIdentity = (state: RootState) => state.currentIdentity
