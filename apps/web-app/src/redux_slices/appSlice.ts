import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState: string = ""
export const logSlice = createSlice({
    name: "log",
    initialState,
    reducers: {
        logMessage: (state, action: PayloadAction<string>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changes
            action.payload
        }
    }
})
export const { logMessage } = logSlice.actions

export default logSlice.reducer
