import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../app/store"

export interface MetaMaskDetails {
    installed: boolean
    connected: boolean
}
const initialState: MetaMaskDetails = { installed: false, connected: false }
export const metaMaskSlice = createSlice({
    name: "metamask",
    initialState,
    reducers: {
        setMetaMaskInstalled: (state, action: PayloadAction<boolean>) => {
            state.installed = action.payload
            return state
        },
        setMetaMaskConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload
            return state
        }
    }
})
export const { setMetaMaskInstalled, setMetaMaskConnected } = metaMaskSlice.actions

export default metaMaskSlice.reducer

export const selectMetaMaskInstalled = (state: RootState) => state.metamask.installed
export const selectMetaMaskConnected = (state: RootState) => state.metamask.connected
