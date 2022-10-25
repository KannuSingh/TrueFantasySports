import React, { useEffect, useState } from "react"
import {
    Box,
    Button,
    Select,
    FormLabel,
    FormControl,
    Flex,
    VStack,
    FormHelperText,
    FormErrorMessage,
    Text,
    HStack,
    Spinner,
    Heading
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Contract } from "ethers"
import detectEthereumProvider from "@metamask/detect-provider"
import { getTFSTokenContract } from "../walletUtils/MetaMaskUtils"
import { selectMetaMaskConnected } from "../redux_slices/metamaskSlice"
import { useSelector } from "react-redux"

function Main() {
    const _metamaskConnected = useSelector(selectMetaMaskConnected)
    const [_sportId, setSportId] = useState("")
    const [_formSubmitted, setFormSubmitted] = useState(false)
    const [_mintFormSubmitted, setMintFormSubmitted] = useState(false)
    const [_mintError, setMintError] = useState(false)
    const [_tfsTokenContract, setTFSTokenContract] = useState<Contract>()
    const [_log, setLog] = useState("")
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            if (!_metamaskConnected) {
                setLog("Please connect your metamask to view contests.")
            } else {
                const ethereum = (await detectEthereumProvider()) as any
                const tfsTokenContract = getTFSTokenContract(ethereum)
                setTFSTokenContract(tfsTokenContract)
            }
        })()
    }, [])

    const handleSelectSports = () => {
        setFormSubmitted(true)
        console.log("Selected sport Id : " + _sportId)
        if (_sportId == "1") {
            navigate(`/cricket`)
        }
    }
    const handleTokenMint = async () => {
        try {
            setMintFormSubmitted(true)

            setLog("Waiting for token mint transaction approval from user...")
            const tokenApprovalTransaction = await _tfsTokenContract!.mint10Token()
            setLog("Waiting for token mint transaction confirmation...")
            await tokenApprovalTransaction.wait()
            setLog("Successfully minted token. Please check you wallet balance...")
            setLog("")
        } catch (e) {
            setLog("")
            setMintError(true)
            console.log(e)
        }
    }

    const isError = _sportId === ""
    return (
        <Flex align="center" justify="center">
            {/** <Link as={RouterLink} to="/identity">
                <Button variant="outline">Create Identity</Button>
    </Link> */}
            <VStack w="100%" spacing={3} p={4}>
                <Box maxW="sm" borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <VStack w="100%" spacing={3} p={4}>
                        <Box borderBottom="1px">
                            <Heading as="h4" size="md">
                                Mint True Fantasy Sports Token
                            </Heading>
                        </Box>
                        <FormControl p={2} isInvalid={_metamaskConnected && _mintFormSubmitted}>
                            <FormLabel as="i" fontSize="xs">
                                Add TFS Token to your wallet
                            </FormLabel>
                            <FormLabel as="i" fontSize="xs">
                                Address : {process.env.TFS_TOKEN_CONTRACT_ADDRESS}
                            </FormLabel>

                            {!_metamaskConnected ? (
                                <FormHelperText>Connect MetaMask Wallet</FormHelperText>
                            ) : (
                                <>
                                    {_mintError ? (
                                        <FormErrorMessage>Can't mint token more than once in 24hrs.</FormErrorMessage>
                                    ) : (
                                        <></>
                                    )}
                                </>
                            )}

                            <Button variant="solid" bg="green.500" onClick={handleTokenMint}>
                                {" "}
                                Mint 10 Token
                            </Button>
                        </FormControl>
                    </VStack>
                    <HStack>
                        {_log != "" ? (
                            <>
                                <Spinner size="md" /> <Text fontSize="xs">{_log}</Text>
                            </>
                        ) : (
                            <></>
                        )}
                    </HStack>
                </Box>
                <VStack w="40%" spacing={3} p={4}>
                    <FormControl isInvalid={isError && _formSubmitted}>
                        <FormLabel>Sports</FormLabel>
                        <Select
                            value={_sportId}
                            onChange={(e) => {
                                setSportId(e.target.value)
                            }}
                            placeholder="Select Sport"
                        >
                            <option value="1">Cricket</option>
                        </Select>
                        {!isError ? <></> : <FormErrorMessage>Select a sport to continue.</FormErrorMessage>}
                    </FormControl>
                    <Button variant="outline" onClick={handleSelectSports}>
                        {" "}
                        Submit
                    </Button>
                </VStack>
            </VStack>
        </Flex>
    )
}

export default Main
