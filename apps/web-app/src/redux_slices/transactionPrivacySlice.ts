import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState: boolean = false
export const transactionPrivacySlice = createSlice({
    name: "transactionPrivacy",
    initialState,
    reducers: {
        setTransactionPrivacy: (state, action: PayloadAction<boolean>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            return action.payload
        }
    }
})

export const { setTransactionPrivacy } = transactionPrivacySlice.actions

export default transactionPrivacySlice.reducer
