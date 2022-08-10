import React, { useCallback, useEffect, useState } from "react"
import {
    Box,
    Text,
    VStack,
    Heading,
    Tabs,
    Tab,
    TabPanel,
    TabPanels,
    TabList,
    HStack,
    Flex,
    SimpleGrid,
    List,
    ListItem,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    ListIcon
} from "@chakra-ui/react"
import { MdCheckCircle, MdAddCircle } from "react-icons/md"
import { useParams } from "react-router-dom"
import { getMatch } from "../data/matches"
import { getSquad } from "../data/squad"
import { getFantasyScorecard } from "../data/fantasyScorecard"
import Contests from "./contests"
import { getTrueFantasySportContract } from "../walletUtils/MetaMaskUtils"
import detectEthereumProvider from "@metamask/detect-provider"
import { parseBytes32String } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { selectAccount } from "../redux_slices/accountSlice"
import { selectIdentity } from "../redux_slices/identitySlice"
import { useSelector, useDispatch } from "react-redux"
import { MyTeam } from "../utils/MyTeam"

interface Match {
    id: number
    title: string
    matchDate: string
    venue: string
    host: string
    opponent: string
    time: string
}
interface Squad {
    matchId: number
    host: string[]
    opponent: string[]
}
interface FantasyScoreCard {
    matchId: number
    host: {
        name: string
        fantasyScore: number
    }[]
    opponent: {
        name: string
        fantasyScore: number
    }[]
}

function CreateTeam(props: { match: Match; squad: Squad; contestId: string }) {
    const _accounts = useSelector(selectAccount)

    const _identityString: string = useSelector(selectIdentity)
    const [_identityCommitment, setIdentityCommitment] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure()

    let contestId = props.contestId
    const selectedPlayers = new Array(30).fill(0)
    const myTeams: MyTeam[] = []
    const [_team, setTeam] = useState(new Array(30).fill(0))
    const [_captainIndex, setCaptainIndex] = useState(-1)
    const [_viceCaptainIndex, setViceCaptainIndex] = useState(-1)
    const _hostSquadLength = props.squad.host.length
    console.log(props.match)

    const handleCreateTeam = () => {
        console.log("handleCreateTeam")
        if (_identityString != "") {
            console.log(_identityString)
            onOpen()
        } else {
            // log = "Login first to create contest"
        }
        // const ethereum = await detectEthereumProvider()
        // console.log(log)
        //dispatch(requestAccounts(ethereum));
    }
    const handleTeamCreation = () => {
        console.log("handleTeamCreation")
    }
    return (
        <Flex align="center" justify="center">
            <VStack w="60%" spacing={3}>
                <Heading as="h3" size="lg">
                    {props.match.title}
                </Heading>
                <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Create Team</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody>
                            <SimpleGrid columns={2} spacing={4}>
                                <Box>
                                    <Text bg="blue" textAlign="center">
                                        {props.match.host}
                                    </Text>
                                    <List spacing={2}>
                                        {props.squad.host.map((playerName, index) => (
                                            <ListItem
                                                _hover={{
                                                    cursor: "pointer"
                                                }}
                                                id={"fsc_" + playerName + index}
                                            >
                                                <HStack justify="space-around">
                                                    <Text w="100%" textAlign="start">
                                                        {playerName}
                                                    </Text>
                                                    {_team[index] == 1 ? (
                                                        <ListIcon as={MdCheckCircle} color="green.500" />
                                                    ) : (
                                                        <ListIcon as={MdAddCircle} />
                                                    )}
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                                <Box>
                                    <Text bg="green" textAlign="center">
                                        {props.match.opponent}
                                    </Text>
                                    <List spacing={2}>
                                        {props.squad.opponent.map((playerName, index) => (
                                            <ListItem
                                                _hover={{
                                                    cursor: "pointer"
                                                }}
                                                id={"fsc_" + playerName + index}
                                            >
                                                <HStack justify="space-around">
                                                    <Text w="100%" textAlign="start">
                                                        {playerName}
                                                    </Text>
                                                    {_team[index] == 1 ? (
                                                        <ListIcon as={MdCheckCircle} color="green.500" />
                                                    ) : (
                                                        <ListIcon as={MdAddCircle} />
                                                    )}
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </SimpleGrid>
                        </ModalBody>

                        <ModalFooter justifyContent="center">
                            <Button mr={3} colorScheme="blue" onClick={handleTeamCreation}>
                                Create and Join
                            </Button>
                            <Button onClick={onClose}>Close</Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </VStack>
        </Flex>
    )
}

export default CreateTeam
