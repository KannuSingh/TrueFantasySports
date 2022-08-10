import { Box, ChakraProvider, ColorModeScript, theme } from "@chakra-ui/react"
import "@fontsource/inter/400.css"
import detectEthereumProvider from "@metamask/detect-provider"
import { Identity } from "@semaphore-protocol/identity"
import { Contract, providers, Signer } from "ethers"
import { hexlify } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { persistStore } from "redux-persist"
import { PersistGate } from "redux-persist/integration/react"
import { createRoot } from "react-dom/client"
import Events from "../../contracts/build/contracts/contracts/Events.sol/Events.json"

import GroupStep from "./components/GroupStep"
import IdentityStep from "./components/IdentityStep"
import ProofStep from "./components/ProofStep"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Header from "./components/header"
import Main from "./components/main"
import IdentityManager from "./components/identity"
import Matches from "./components/matches"
import Match from "./components/match"
import store from "./app/store"
import { Provider } from "react-redux"
import Contest from "./components/contest"

function App() {
    const [_logs, setLogs] = useState<string>("")
    const [_step, setStep] = useState<number>(1)
    const [_identity, setIdentity] = useState<Identity>()
    const [_signer, setSigner] = useState<Signer>()
    const [_contract, setContract] = useState<Contract>()
    const [_event, setEvent] = useState<any>()

    return (
        <>
            <BrowserRouter>
                {/*<Container maxW="lg" flex="1" display="flex" alignItems="center">*/}
                <Box minH="100vh" p={3} fontSize="xl">
                    <Header />
                    <hr />
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="/identity" element={<IdentityManager />} />
                        <Route path="/matches" element={<Matches />} />
                        <Route path="/matches/:matchId" element={<Match />} />
                        <Route path="/matches/:matchId/contests/:contestId" element={<Contest />} />
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
                {/*         <Stack>
                        {_step === 1 ? (
                            <IdentityStep onChange={setIdentity} onLog={setLogs} onNextClick={() => setStep(2)} />
                        ) : _step === 2 ? (
                            <GroupStep
                                signer={_signer}
                                contract={_contract}
                                identity={_identity as Identity}
                                onPrevClick={() => setStep(1)}
                                onSelect={(event) => {
                                    setEvent(event)
                                    setStep(3)
                                }}
                                onLog={setLogs}
                            />
                        ) : (
                            <ProofStep
                                signer={_signer}
                                contract={_contract}
                                identity={_identity as Identity}
                                event={_event}
                                onPrevClick={() => setStep(2)}
                                onLog={setLogs}
                            />
                        )}
                    </Stack>
                </Container>

                <HStack
                    flexBasis="56px"
                    borderTop="1px solid #8f9097"
                    backgroundColor="#DAE0FF"
                    align="center"
                    justify="center"
                    spacing="4"
                    p="4"
                >
                    {_logs.endsWith("...") && <Spinner color="primary.400" />}
                    <Text fontWeight="bold">{_logs || `Current step: ${_step}`}</Text>
                        </HStack> */}
            </BrowserRouter>
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
