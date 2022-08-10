import React from "react"
import detectEthereumProvider from "@metamask/detect-provider"
import {
    Avatar,
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "../ColorModeSwitcher"
import { accountsChanged, requestAccounts, selectAccount } from "../redux_slices/accountSlice"
import { hexlify } from "ethers/lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { createIdentity } from "../redux_slices/identitySlice"
import { Identity } from "@semaphore-protocol/identity"
import { changeUserIdentity, selectUserIdentity } from "../redux_slices/userSlice"

function Header() {
    const [_metaMaskInstalled, setMetaMaskInstalled] = useState(false)
    const [_metaMaskConnected, setMetaMaskConnected] = useState(false)
    const _savedIdentity = useSelector(selectUserIdentity)
    const [_identityString, setIdentity] = useState(_savedIdentity)
    const [_isUserLoggedIn, setUserLoggedIn] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [_password, setPassword] = useState("")
    const [_sudoName, setSudoName] = useState("")
    const [_name, setName] = useState("")
    const accounts = useSelector(selectAccount)
    const dispatch = useAppDispatch()

    useEffect(() => {
        ;(async () => {
            const ethereum = (await detectEthereumProvider()) as any
            //checking if the MetaMask extension is installed
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                //if installed
                setMetaMaskInstalled(true)
                if (accounts.length > 0) {
                    setMetaMaskConnected(true)
                }
                if (_identityString != "") {
                    setUserLoggedIn(true)
                }
                ethereum.on("accountsChanged", (newAccounts: string[]) => {
                    if (newAccounts.length !== 0 && accounts[0] != newAccounts[0]) {
                        setMetaMaskConnected(true)
                        //dispatch(accountsChanged(newAccounts))

                        setUserLoggedIn(false)
                        handleLogin()
                    }
                })
            }
        })()
    }, [])

    const handleConnect = async () => {
        console.log("handleConnect : " + process.env.ETHEREUM_CHAIN_ID)
        const ethereum = (await detectEthereumProvider()) as any
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [
                {
                    chainId: hexlify(Number(process.env.ETHEREUM_CHAIN_ID!)).replace("0x0", "0x")
                }
            ]
        })
        setMetaMaskConnected(true)
        dispatch(requestAccounts(ethereum))
    }

    const handleInstall = async () => {
        const ethereum = await detectEthereumProvider()
        console.log("handleCInstall")
        //dispatch(requestAccounts(ethereum));
    }
    const handleLogin = async () => {
        if (!_metaMaskConnected) {
            await handleConnect()
            onOpen()
        } else {
            onOpen()
        }
        // const ethereum = await detectEthereumProvider()
        console.log("handleLogin")
        //dispatch(requestAccounts(ethereum));
    }
    const handleIdentityCreation = async () => {
        if (accounts.length > 0) {
            console.log("handleIdentityCreation : " + process.env.ETHEREUM_CHAIN_ID)
            const ethereum = (await detectEthereumProvider()) as any
            var signature: string = await ethereum.request({
                method: "personal_sign",
                params: [_password, accounts[0]]
            })
            console.log("Signature : " + signature)

            const identity = new Identity(signature)

            //const identityString: string = "{'name':'" + _sudoName + "','value':'" + identity.toString() + "'}"

            dispatch(changeUserIdentity(identity.toString()))
            setName(_sudoName)
            setUserLoggedIn(true)
            setSudoName("")
            setPassword("")
            onClose()
        } else {
            console.log("First connect Metamask")
        }
    }

    return (
        <Flex justify="space-between" align="center" p={5}>
            <Heading as="h1">True Fantasy Sport</Heading>
            <Box as="div" alignSelf="center">
                <HStack>
                    <Select defaultValue={1337} width="40%" placeholder="Select chain">
                        <option value={1337}>Localhost</option>
                        <option value={4}>Rinkbey testnet</option>
                    </Select>
                    {process.env.ETHEREUM_CHAIN_ID ? (
                        <Text fontSize="xs">Chain: {process.env.ETHEREUM_CHAIN_ID}</Text>
                    ) : (
                        <></>
                    )}
                    {accounts[0] ? (
                        <Text fontSize="xs">Account: {accounts[0].toString().substring(0, 15)}...</Text>
                    ) : (
                        <></>
                    )}
                    {_metaMaskInstalled ? (
                        <Button
                            colorScheme={_metaMaskConnected ? "green" : "gray"}
                            isDisabled={_metaMaskConnected}
                            onClick={handleConnect}
                        >
                            {_metaMaskConnected ? "Connected" : "Connect Metamask"}
                        </Button>
                    ) : (
                        <Button onClick={handleInstall}>Install MetaMask</Button>
                    )}
                    {_isUserLoggedIn ? (
                        <Avatar size="md" name={_name} />
                    ) : (
                        <Button colorScheme="green" onClick={handleLogin}>
                            Login
                        </Button>
                    )}
                    // Modal for Login ( Login Form)
                    <Modal isOpen={isOpen} onClose={onClose}>
                        <ModalOverlay />
                        <ModalContent>
                            <ModalHeader>Login</ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>
                                <VStack>
                                    <Input
                                        htmlSize={25}
                                        width="auto"
                                        placeholder="Enter sudo name "
                                        value={_sudoName}
                                        onChange={(e) => setSudoName(e.target.value)}
                                    />
                                    <Input
                                        htmlSize={25}
                                        width="auto"
                                        placeholder="Enter secret text / password"
                                        value={_password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </VStack>
                            </ModalBody>

                            <ModalFooter justifyContent="center">
                                <Button mr={3} colorScheme="blue" onClick={handleIdentityCreation}>
                                    Create Identity
                                </Button>
                                <Button onClick={onClose}>Close</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                    <ColorModeSwitcher alignSelf="center" />
                </HStack>
            </Box>
        </Flex>
    )
}

export default Header
