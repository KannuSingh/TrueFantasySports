import React from "react"
import detectEthereumProvider from "@metamask/detect-provider"
import {
    Avatar,
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Switch,
    Text,
    useDisclosure,
    VStack
} from "@chakra-ui/react"
import { MdCircle } from "react-icons/md"
import { ColorModeSwitcher } from "../ColorModeSwitcher"
import { accountsChanged, requestAccounts, selectAccounts } from "../redux_slices/accountSlice"
import { hexlify } from "ethers/lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectCurrentIdentity, setCurrentIdentity } from "../redux_slices/identitySlice"
import { selectPrivacyMode, setPrivacyMode } from "../redux_slices/transactionPrivacySlice"
import { Identity } from "@semaphore-protocol/identity"
import { addUser, UserPayload } from "../redux_slices/userSlice"
import {
    selectMetaMaskConnected,
    selectMetaMaskInstalled,
    setMetaMaskInstalled,
    setMetaMaskConnected
} from "../redux_slices/metamaskSlice"

function Header() {
    const _metaMaskInstalled = useSelector(selectMetaMaskInstalled)
    const _metaMaskConnected = useSelector(selectMetaMaskConnected)

    const _identityString = useSelector(selectCurrentIdentity)
    const [_isUserLoggedIn, setUserLoggedIn] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [_password, setPassword] = useState("")
    const [_sudoName, setSudoName] = useState("")
    const [_name, setName] = useState("")
    const [_chainId, setChainId] = useState("")
    const _isPrivacyMode = useSelector(selectPrivacyMode)
    const _accounts: string[] = useSelector(selectAccounts)
    const dispatch = useAppDispatch()

    useEffect(() => {
        ;(async () => {
            const ethereum = (await detectEthereumProvider()) as any
            //checking if the MetaMask extension is installed
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                //if installed
                console.log("Installed")
                dispatch(setMetaMaskInstalled(true))
                if (_accounts.length > 0) {
                    setMetaMaskConnected(true)
                }
                if (_identityString != "") {
                    setUserLoggedIn(true)
                }
                ethereum.on("accountsChanged", (newAccounts: string[]) => {
                    if (newAccounts.length !== 0 && _accounts[0] != newAccounts[0]) {
                        console.log("User changed account in their metamask wallet")
                        window.alert("Account changed detected, Changing account in application")
                        dispatch(accountsChanged(newAccounts))
                        if (_isPrivacyMode) {
                            //setUserLoggedIn(false)
                            handleLogin()
                        }
                    }
                })
            }
            setChainId(process.env.ETHEREUM_CHAIN_ID!)
        })()
    }, [])

    const handleConnect = async () => {
        console.log("handleMetaMaskConnect : " + _chainId)
        const ethereum = (await detectEthereumProvider()) as any
        if (_chainId) {
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [
                    {
                        chainId: hexlify(Number(_chainId!)).replace("0x0", "0x")
                    }
                ]
            })
            var accounts: string[] = await ethereum.request({
                method: "eth_requestAccounts"
            })

            dispatch(accountsChanged(accounts))
            dispatch(setMetaMaskConnected(true))
        }
    }

    const handleInstall = async () => {
        const ethereum = await detectEthereumProvider()
        console.log("handleCInstall")
        //dispatch(requestAccounts(ethereum));
    }
    const handleLogin = async () => {
        console.log("handleLogin")
        if (!_metaMaskConnected) {
            await handleConnect()
            onOpen()
        } else {
            onOpen()
        }
        // const ethereum = await detectEthereumProvider()

        //dispatch(requestAccounts(ethereum));
    }
    const handleIdentityCreation = async () => {
        if (_accounts.length > 0) {
            console.log("handleIdentityCreation : " + _chainId)
            const ethereum = (await detectEthereumProvider()) as any
            var signature: string = await ethereum.request({
                method: "personal_sign",
                params: [_password, _accounts[0]]
            })
            console.log("Signature : " + signature)

            const identity = new Identity(signature)

            //const identityString: string = "{'name':'" + _sudoName + "','value':'" + identity.toString() + "'}"
            const userPayload: UserPayload = {
                isPrivateUser: _isPrivacyMode,
                identityString: identity.toString()
            }
            dispatch(addUser(userPayload))
            dispatch(setCurrentIdentity(identity.toString()))
            setName(_sudoName)
            setUserLoggedIn(true)
            setSudoName("")
            setPassword("")
            onClose()
        } else {
            console.log("First connect Metamask")
        }
    }
    const handlePrivacyModeToggle = () => {
        if (!_isPrivacyMode) {
            handleLogin()
        } else {
            dispatch(setCurrentIdentity(""))
        }
        dispatch(setPrivacyMode(!_isPrivacyMode))
    }

    return (
        <Flex justify="space-between" align="center" p={5}>
            <Heading as="h1">True Fantasy Sport</Heading>
            <Box as="div" alignSelf="center">
                <HStack>
                    <FormControl display="flex" justifyContent="end" alignItems="center">
                        <FormLabel htmlFor="transaction-privacy" mb="0">
                            {_isPrivacyMode ? "Privacy" : "Public"}
                        </FormLabel>
                        <Switch
                            isChecked={_isPrivacyMode}
                            onChange={handlePrivacyModeToggle}
                            id="transaction-privacy"
                        />
                    </FormControl>
                    <Select
                        value={_chainId}
                        onChange={(e) => {
                            setChainId(e.target.value)
                        }}
                        width="50%"
                    >
                        <option value="4">Rinkbey testnet</option>
                    </Select>
                    {_chainId != "" ? <Text fontSize="xs">Chain: {_chainId}</Text> : <></>}
                    {_accounts[0] ? (
                        <Text fontSize="xs">Account: {_accounts[0].toString().substring(0, 15)}...</Text>
                    ) : (
                        <></>
                    )}
                    {_metaMaskInstalled ? (
                        <HStack>
                            {_metaMaskConnected ? (
                                <>
                                    <Icon as={MdCircle} color={_metaMaskConnected ? "green" : "red"} />
                                    <Text fontSize="xs">Connected </Text>
                                </>
                            ) : (
                                <Button onClick={handleConnect}>Connect Metamask</Button>
                            )}
                        </HStack>
                    ) : (
                        <Button onClick={handleInstall}>Install MetaMask</Button>
                    )}
                    {_isPrivacyMode && _identityString != "" ? (
                        <Avatar size="md" name={_name} />
                    ) : _isPrivacyMode && _identityString == "" ? (
                        <Button colorScheme="green" onClick={handleLogin}>
                            Login
                        </Button>
                    ) : (
                        <></>
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
                                    LOGIN
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
