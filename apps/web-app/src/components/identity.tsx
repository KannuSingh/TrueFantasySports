import React from "react"
import { useEffect, useState } from "react"
import detectEthereumProvider from "@metamask/detect-provider"
import { hexlify } from "ethers/lib/utils"
import { selectAccount } from "../redux_slices/accountSlice"
import { useSelector, useDispatch } from "react-redux"
import { Box, Heading, Input, VStack, Link, Button, Text, HStack } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../app/hooks"
import identitySlice, { createIdentity, selectIdentity } from "../redux_slices/identitySlice"
import { Identity } from "@semaphore-protocol/identity"

function IdentityManager() {
    const accounts: string[] = useSelector(selectAccount)
    const _identityString: string = useSelector(selectIdentity)
    let [_identity, setIdentity] = useState<Identity>()
    const [_secretMessage, setSecretMessage] = useState("")
    const [_sudoName, setSudoName] = useState("")
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (_identityString != "") {
            setIdentity(new Identity(_identityString))
        }
    }, [_identityString])
    const handleIdentityCreation = async () => {
        if (accounts.length > 0) {
            console.log("handleIdentityCreation : " + process.env.ETHEREUM_CHAIN_ID)
            const ethereum = (await detectEthereumProvider()) as any
            var signature: string = await ethereum.request({
                method: "personal_sign",
                params: [_secretMessage, accounts[0]]
            })
            console.log("Signature : " + signature)

            const identity = new Identity(signature)

            //const identityString: string = "{'name':'" + _sudoName + "','value':'" + identity.toString() + "'}"
            dispatch(createIdentity(identity.toString()))
            _identity = identity
        } else {
            console.log("First connect Metamask")
        }
    }
    const handleClearIdentity = async () => {
        console.log("handleClearIdentity : " + process.env.ETHEREUM_CHAIN_ID)

        dispatch(createIdentity(""))
        setSudoName("")
        setSecretMessage("")
    }
    const handleSaveLocally = async () => {
        console.log("handleSaveLocally : " + process.env.ETHEREUM_CHAIN_ID)
    }

    return (
        <Box p={5}>
            <Heading as="h3" size="lg">
                Create Identity
            </Heading>
            <VStack spacing={5}>
                {_identityString != "" && _identity != undefined ? (
                    <Box justifyItems="center" py="6">
                        <VStack alignItems="start" p="5" borderWidth={1} borderColor="gray.500" borderRadius="4px">
                            <Text>Existing Identity Details</Text>
                            <Text>Trapdoor: {_identity.getTrapdoor().toString().substring(0, 30)}...</Text>
                            <Text>Nullifier: {_identity.getNullifier().toString().substring(0, 30)}...</Text>
                            <Text>Commitment: {_identity.generateCommitment().toString().substring(0, 30)}...</Text>
                            <HStack>
                                <Button onClick={handleSaveLocally}>Save Identity Locally</Button>

                                <Button onClick={handleClearIdentity}>Clear Existing Identity</Button>
                            </HStack>
                        </VStack>
                        <Link as={RouterLink} to="/matches">
                            <Button variant="outline">View Matches</Button>
                        </Link>
                    </Box>
                ) : (
                    <Box py="6">
                        <HStack>
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
                                value={_secretMessage}
                                onChange={(e) => setSecretMessage(e.target.value)}
                            />
                            <Button onClick={handleIdentityCreation}>Create identity</Button>
                        </HStack>
                    </Box>
                )}
            </VStack>
        </Box>
    )
}

export default IdentityManager
