import React from "react"
import detectEthereumProvider from "@metamask/detect-provider"
import {
    Avatar,
    Box,
    Button,
    Center,
    Flex,
    Heading,
    HStack,
    Icon,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
    Portal,
    Select,
    Text,
    useBoolean,
    VStack,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "../ColorModeSwitcher"
import { accountsChanged, requestAccounts, selectAccounts } from "../redux_slices/accountSlice"
import { hexlify } from "ethers/lib/utils"
import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import { selectPrivacyMode, setPrivacyMode } from "../redux_slices/transactionPrivacySlice"
import { addUser, UserPayload } from "../redux_slices/userSlice"
import {
    selectMetaMaskConnected,
    selectMetaMaskInstalled,
    setMetaMaskInstalled,
    setMetaMaskConnected
} from "../redux_slices/metamaskSlice"
import {PassportReader} from "@gitcoinco/passport-sdk-reader"
import AlertDialogNotification from "./alertDialogNotification"
import { FaChevronDown, FaChevronRight, FaChevronUp, FaCopy, FaPowerOff } from "react-icons/fa"

function Header() {
    const _metaMaskInstalled = useSelector(selectMetaMaskInstalled)
    const _metaMaskConnected = useSelector(selectMetaMaskConnected)
    const [_chainId, setChainId] = useState("")
    const _isPrivacyMode = useSelector(selectPrivacyMode)
    const [isAccountDetailOpen, setIsAccountDetailOpen] = useBoolean()
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
               
                ethereum.on("accountsChanged", (newAccounts: string[]) => {
                    if (newAccounts.length !== 0 && _accounts[0] != newAccounts[0]) {
                        console.log("User changed account in their metamask wallet")
                       
                        dispatch(accountsChanged(newAccounts))
                       // window.alert("Account changed detected, Changing account in application")
                       
                    }
                })
            }
            setChainId(process.env.ETHEREUM_CHAIN_ID!)
        })()
    }, [])

    const handleChainSwitch =async (selectedChainId) =>{
        const ethereum = (await detectEthereumProvider()) as any
        if (selectedChainId) {
            try{
                await ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [
                        {
                            chainId: hexlify(Number(selectedChainId!)).replace("0x0", "0x")
                        }
                    ]
                })
                setChainId(selectedChainId);

            }
            catch(e){

                console.log(e)
            }
            
    }}


    const handleConnect = async () => {
        console.log("handleMetaMaskConnect : " + _chainId)
        try{
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

                const reader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");

                // read a Passport for any Ethereum Address
                const passport = await reader.getPassport(accounts[0]);
               
                console.log("Account :"+accounts[0] )
                console.log("Passport Details: "+JSON.stringify(passport))
               
                dispatch(accountsChanged(accounts))
                dispatch(setMetaMaskConnected(true))
               
                const userPayload: UserPayload = {
                    isPrivateUser: _isPrivacyMode,
                    identityString: accounts[0]
                }
                dispatch(addUser(userPayload))
            }
        }catch(e){
            console.log(e)
            console.log(`You need to switch to ${_chainId} chain id and connect you account`)
        }
    }

    const handleInstall = async () => {
        const ethereum = await detectEthereumProvider()
        console.log("handleCInstall")
        //dispatch(requestAccounts(ethereum));
    }

    return (
        <Flex align="center" p={2}>
           
            <HStack w="40%" spacing="2">
                    <Heading as="h1" size='lg'>True Fantasy Sport</Heading>
            </HStack>
            <HStack w="60%"  justify='end' spacing="2">
                <Select
                    value={_chainId}
                    onChange={(e) => {
                        handleChainSwitch(e.target.value);
                    }}
                    w="25%"
                >
                    <option value="280" selected>ZkSync Alpha Testnet</option>
                </Select>

                {_metaMaskInstalled ? (
                    <>
                        {_metaMaskConnected && _accounts[0] ? (
                        <Popover
                            isOpen={isAccountDetailOpen}
                            onOpen={setIsAccountDetailOpen.on}
                            onClose={setIsAccountDetailOpen.off}
                            placement='bottom-end'
                        >
                            <PopoverTrigger>
                                <Button 
                                    leftIcon={<Avatar size='sm'/>} 
                                    rightIcon={isAccountDetailOpen ? <Icon w={3} h={3} as={FaChevronUp} /> : <Icon w={3} h={3} as={FaChevronDown} /> } 
                                    >
                                       {_accounts[0].toString().substring(0, 6)+'...'+_accounts[0].toString().substring(38)}
                                </Button>
                           
                            </PopoverTrigger>
                            <Portal>
                                <PopoverContent>
                                <PopoverArrow />
                                <PopoverHeader
                                    borderBottomWidth='0px'
                                >
                                    <HStack justify='space-between'>
                                        <HStack>
                                            <Avatar size='sm'/> 
                                            <Text> 
                                                {_accounts[0].toString().substring(0, 6)+'...'+_accounts[0].toString().substring(38)}
                                            </Text>
                                        </HStack>
                                        <HStack spacing='1'>
                                            <Button size='sm'><Icon w={3} h={3} as={FaCopy} /></Button>
                                            
                                            <Button colorScheme='red' size='sm'><Icon w={3} h={3} as={FaPowerOff} /></Button>
                                           
                                        </HStack>
                                    </HStack>
                                </PopoverHeader>
                                <PopoverBody>
                                    <Center>
                                        <VStack spacing='1'>
                                            <Text fontSize='2xl'>23450</Text>
                                            <Text fontSize='3xl'>TFS</Text>
                                        </VStack>
                                    </Center>
                                </PopoverBody>
                                <PopoverFooter>
                                    <VStack align='start'>
                                        <HStack  w='100%' justify='space-between'>
                                            <Text>My Contests</Text>
                                            <Icon w={3} h={3} as={FaChevronRight} />
                                        </HStack>
                                        <HStack  w='100%' justify='space-between'>
                                            <Text>History</Text>
                                            <Icon w={3} h={3} as={FaChevronRight} />
                                        </HStack>
                                        <HStack  w='100%' justify='space-between'>
                                            <Text>Settings</Text>
                                            <Icon w={3} h={3} as={FaChevronRight} />
                                        </HStack>
                                    </VStack>

                                </PopoverFooter>
                                </PopoverContent>
                            </Portal>
                        </Popover>
                        ) : (
                        <Button onClick={handleConnect} > Connect Metamask</Button>
                        )}
                    </>
                ) : (
                    <Button onClick={handleInstall}>Install MetaMask</Button>
                )}
                
                
               { //Alert Dialog 
                //  <AlertDialogNotification dialogBody={"Hello Body"} dialogHeader={"Error"} />
               } 
                <ColorModeSwitcher alignSelf="center" />
            </HStack>
        </Flex>
    )
}

export default Header
