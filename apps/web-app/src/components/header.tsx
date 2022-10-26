import React from "react"
import detectEthereumProvider from "@metamask/detect-provider"
import {
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    Flex,
    FlexProps,
    Heading,
    HStack,
    Icon,
    IconButton,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
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
    useColorModeValue,
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
import {CeramicPassport, PassportReader} from "@gitcoinco/passport-sdk-reader"
import {PassportVerifier} from "@gitcoinco/passport-sdk-verifier"
import AlertDialogNotification from "./alertDialogNotification"
import { FaCheckCircle, FaChevronDown, FaChevronRight, FaChevronUp, FaCopy, FaPowerOff, FaRedo } from "react-icons/fa"
import { FiBell, FiChevronDown, FiMenu ,} from "react-icons/fi"
import { BiWalletAlt } from "react-icons/bi"

function Header({ onOpen, ...rest }: MobileProps) {
    const _metaMaskInstalled = useSelector(selectMetaMaskInstalled)
    const _metaMaskConnected = useSelector(selectMetaMaskConnected)
    const [_chainId, setChainId] = useState("")
    const _isPrivacyMode = useSelector(selectPrivacyMode)
    const [isAccountDetailOpen, setIsAccountDetailOpen] = useBoolean()
    const _accounts: string[] = useSelector(selectAccounts)
    const [_isPassportConnected, setIsPassportConnected] = useState(false)
   
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

                const reader:PassportReader = new PassportReader("https://ceramic.passport-iam.gitcoin.co", "1");
                
                // read a Passport for any Ethereum Address
                const passport : CeramicPassport = await reader.getPassport(accounts[0]);
                if(JSON.stringify(passport) != 'false'){
                    console.log(`ExpiryDate : ${passport.expiryDate}`);
                    console.log(`IssuanceDate : ${passport.issuanceDate}` );
                    console.log(`Stamps : ${passport.stamps}` );
                    setIsPassportConnected(true)

                    console.log(JSON.stringify(passport.stamps))
                    //const verifier = new PassportVerifier("https://ceramic.passport-iam.gitcoin.co", "1");
                    //const verifiedPassport = await verifier.verifyPassport(accounts[0]);

                    //console.log('************-------------------************')
                    //console.log("Verified Passport : "+JSON.stringify(verifiedPassport))

                   
                }
                else{
                    
                }
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

    const handleDisconnect = () =>{
        dispatch(accountsChanged([]))
        dispatch(setMetaMaskConnected(false))
    }

    const handleRefreshProfile = async() =>{

    }

    const handleInstall = async () => {
        const ethereum = await detectEthereumProvider()
        console.log("handleCInstall")
        //dispatch(requestAccounts(ethereum));
    }

    return (
       
        <Flex 
        ml={{ base: 0, md: 0 }}
        px={{ base: 4, md: 4 }}
        pos="fixed"
        width='full'
        height="20"
        top='0'
        alignItems="center"
        bg={useColorModeValue('white', 'gray.900')}
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        justifyContent={{ base: 'space-between', md: 'space-between' }}
        {...rest}>
           <IconButton
                display={{ base: 'flex', md: 'none' }}
                onClick={onOpen}
                variant="outline"
                aria-label="open menu"
                icon={<FiMenu />}
            />
           <Text
                display={{ base: 'flex', md: 'none' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold">
                TFS
            </Text>

            
            <Text
                display={{ base: 'none', md: 'flex' }}
                fontSize="2xl"
                fontFamily="monospace"
                fontWeight="bold"
                whiteSpace='nowrap'>
                True Fantasy Sports
            </Text>
            
            <HStack 
                justifyContent={{ base: 'flex-end', md: 'flex-end' }}
                spacing={{ base: '0', md: '2' }}>
                
                
                <Select
                    defaultValue='280'
                    onChange={(e) => {
                        handleChainSwitch(e.target.value);
                    }}
                    w="25%"
                >
                    <option value="280" >ZkSync Alpha Testnet</option>
                </Select>
                

                <IconButton
                    size="lg"
                    variant="ghost"
                    aria-label="open menu"
                    icon={<FiBell />}
                />
                {_metaMaskInstalled ? (
                    <>
                        {_metaMaskConnected && _accounts[0] ? (
                        <Popover
                            isOpen={isAccountDetailOpen}
                            onOpen={setIsAccountDetailOpen.on}
                            onClose={setIsAccountDetailOpen.off}
                            placement='bottom-end'
                            isLazy
                        >
                            <PopoverTrigger>
                                <Button 
                                bg='none'
                                    leftIcon={<Avatar 
                                                size='sm'
                                                src={
                                                    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9'
                                                  }
                                                />} 
                                    rightIcon={isAccountDetailOpen ? <Icon w={3} h={3} as={FaChevronUp} /> : <Icon w={3} h={3} as={FaChevronDown} /> } 
                                    variant='ghost'
                                    _focus={{ boxShadow: 'none' , background:'none'}}
                                    _hover={{background:'none'}}
                                    >
                                       {_accounts[0].toString().substring(0, 6)+'...'+_accounts[0].toString().substring(38)}
                                </Button>
                           
                            </PopoverTrigger>
                            <Portal>
                                <PopoverContent 
                                bg={useColorModeValue('white', 'gray.900')}
                                borderColor={useColorModeValue('gray.200', 'gray.700')}
                                >
                                <PopoverArrow />
                                <PopoverHeader
                                    borderBottomWidth='0px'
                                >
                                    <HStack justify='space-between'>
                                        <HStack>
                                            <Icon 
                                                aria-label="wallet"
                                                as={BiWalletAlt}
                                            />
                                            <Text> 
                                                {_accounts[0].toString().substring(0, 6)+'...'+_accounts[0].toString().substring(38)}
                                            </Text>
                                            {_isPassportConnected ?  <Icon  w={3} h={3} as={FaCheckCircle} color='green' /> : <></>}
                                           
                                            
                                        </HStack>
                                        <HStack spacing='1'>
                                            <Button size='sm'><Icon w={3} h={3} as={FaCopy} /></Button>
                                            <Button onClick={handleRefreshProfile}  size='sm'><Icon w={3} h={3} as={FaRedo} /></Button>
                                            
                                            <Button onClick={handleDisconnect} colorScheme='red' size='sm'><Icon w={3} h={3} as={FaPowerOff} /></Button>
                                           
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
                                <PopoverFooter px='2'>
                                    <VStack align='start'>
                                        <Button justifyContent='space-between' 
                                                p='2' w='100%' 
                                                size='sm'
                                                variant='ghost' 
                                                rightIcon={<Icon w={3} h={3} as={FaChevronRight} />}
                                        >
                                            Current Contests
                                        </Button>

                                        <Button justifyContent='space-between' 
                                                p='2' w='100%' 
                                                size='sm'
                                                variant='ghost' 
                                                rightIcon={<Icon w={3} h={3} as={FaChevronRight} />}
                                        >
                                           Past Contests
                                        </Button>

                                        <Button justifyContent='space-between' 
                                                p='2' w='100%' 
                                                size='sm'
                                                variant='ghost' 
                                                rightIcon={<Icon w={3} h={3} as={FaChevronRight} />}
                                        >
                                            <Text>GitCoin Passport 
                                                {_isPassportConnected ? <Badge ml='1' colorScheme='green'>Verified</Badge> 
                                                : <Badge ml='1' colorScheme='red'>Not Verified</Badge>}
                                            </Text>
                                        </Button>

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
interface MobileProps extends FlexProps {
    onOpen: () => void;
  }



export default Header
