import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const initialState: string = ""
export const logSlice = createSlice({
    name: "log",
    initialState,
    reducers: {
        logMessage: (state, action: PayloadAction<string>) => {
            action.payload
        }
    }
})
export const { logMessage } = logSlice.actions

export default logSlice.reducer
