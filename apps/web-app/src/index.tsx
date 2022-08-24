import React from "react"
import { Box, ChakraProvider, ColorModeScript, theme } from "@chakra-ui/react"
import "@fontsource/inter/400.css"
import { persistStore } from "redux-persist"
import { PersistGate } from "redux-persist/integration/react"
import { createRoot } from "react-dom/client"
import { HashRouter, Route, Routes } from "react-router-dom"
import Header from "./components/header"
import Main from "./components/main"
import IdentityManager from "./components/identity"
import Matches from "./components/matches"
import Match from "./components/match"
import store from "./app/store"
import { Provider } from "react-redux"
import Contest from "./components/contest"
import Cricket from "./components/sports/cricket"
import Fixtures from "./components/sports/fixtures"

function App() {
    return (
        <>
            <HashRouter>
                <Box minH="100vh" p={3} fontSize="xl">
                    <Header />
                    <hr />
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/cricket" element={<Cricket />}>
                            <Route path="/cricket/leagues/:leagueId/fixtures" element={<Fixtures />} />
                            <Route path="/cricket/fixtures/:fixtureId" element={<Match />} />
                            <Route path="/cricket/fixtures/:fixtureId/contests/:contestId" element={<Contest />} />
                        </Route>
                        <Route path="/identity" element={<IdentityManager />} />
                        <Route path="/matches" element={<Matches />} />

                        <Route
                            path="*"
                            element={
                                <main style={{ padding: "1rem" }}>
                                    <p>There's nothing here!</p>
                                </main>
                            }
                        />
                    </Routes>
                </Box>
            </HashRouter>
        </>
    )
}

const root = createRoot(document.getElementById("root") as HTMLElement)
let persistor = persistStore(store)
root.render(
    <ChakraProvider theme={theme}>
        <ColorModeScript />
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </ChakraProvider>
)
