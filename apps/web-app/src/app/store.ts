import { combineReducers } from "redux"
import { configureStore } from "@reduxjs/toolkit"
import storage from "redux-persist/lib/storage"
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import accountReducer from "../redux_slices/accountSlice"
import identityReducer from "../redux_slices/identitySlice"
import usersReducer from "../redux_slices/userSlice"
import logReducer from "../redux_slices/logSlice"
import metaMaskReducer from "../redux_slices/metamaskSlice"
import transactionPrivacyModeReducer from "../redux_slices/transactionPrivacySlice"

const persistConfig = {
    key: "root",
    storage
}

const rootReducer = combineReducers({
    metamask: metaMaskReducer,
    accounts: accountReducer,
    currentIdentity: identityReducer,
    isPrivacyMode: transactionPrivacyModeReducer,
    usersDetails: usersReducer,
    log: logReducer
})
const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export default store
