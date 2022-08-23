import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../app/store"

const initialState: boolean = false
export const transactionPrivacyModeSlice = createSlice({
    name: "transactionPrivacyMode",
    initialState,
    reducers: {
        setPrivacyMode: (state, action: PayloadAction<boolean>) => {
            return action.payload
        }
    }
})

export const { setPrivacyMode } = transactionPrivacyModeSlice.actions

export default transactionPrivacyModeSlice.reducer
export const selectPrivacyMode = (state: RootState) => state.isPrivacyMode
