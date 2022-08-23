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
    ListIcon,
    Tooltip
} from "@chakra-ui/react"
import { MdCheckCircle, MdAddCircle, MdPerson, MdPersonOutline } from "react-icons/md"
import { useParams } from "react-router-dom"
import { getMatch } from "../data/matches"
import { getSquad } from "../data/squad"
import { getFantasyScorecard } from "../data/fantasyScorecard"
import Contests from "./contests"
import { getTrueFantasySportContract } from "../walletUtils/MetaMaskUtils"
import detectEthereumProvider from "@metamask/detect-provider"
import { parseBytes32String } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { selectAccounts } from "../redux_slices/accountSlice"
import { selectCurrentIdentity } from "../redux_slices/identitySlice"
import { useSelector, useDispatch } from "react-redux"
import { MyTeam } from "../utils/MyTeam"
import { Fixture, SquadInfo } from "../Model/model"
import { calculateMyTeamHash } from "../utils/poseidenUtil"
import { useAppDispatch } from "../app/hooks"
import { addTeamAndTeamHash, Contest, UserContestPayload } from "../redux_slices/userSlice"
import { selectPrivacyMode } from "../redux_slices/transactionPrivacySlice"

function CreateTeam(props: {
    isOpen: boolean
    fixture: Fixture
    localTeamSquad: SquadInfo[]
    visitorTeamSquad: SquadInfo[]
    contestId: string
    onClose
}) {
    const _accounts = useSelector(selectAccounts)
    const isPrivacyMode = useSelector(selectPrivacyMode)
    const _identityString: string = useSelector(selectCurrentIdentity)
    const [_identityCommitment, setIdentityCommitment] = useState("")

    let contestId = props.contestId
    const selectedPlayers = new Array(30).fill(0)
    const myTeams: MyTeam[] = []
    const [_players, setPlayers] = useState(new Array(60).fill(0))
    const [_matchId, setMatchId] = useState(props.fixture.id)
    const [_captainIndex, setCaptainIndex] = useState(-1)
    const [_viceCaptainIndex, setViceCaptainIndex] = useState(-1)
    const [_localTeamSquadLength, setLocalTeamSquadLength] = useState<number>()
    const [_myTeamHash, setTeamHash] = useState<string>("")
    const dispatch = useAppDispatch()

    const handlePlayerSelection = (playerOf: string, index: number) => {
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        if (selectedPlayersCount < 11) {
            let myTeam = [..._players]
            if (playerOf == "host") {
                myTeam[index] = 1
            } else if (playerOf == "opponent") {
                myTeam[_localTeamSquadLength! + index] = 1
            }
            setPlayers(myTeam)
        } else {
            console.log("Can not select more that eleven (11) players")
        }
    }
    const handlePlayerDeSelection = (playerOf: string, index: number) => {
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        if (selectedPlayersCount <= 11) {
            let myTeam = [..._players]
            if (playerOf == "host") {
                myTeam[index] = 0
            } else if (playerOf == "opponent") {
                myTeam[_localTeamSquadLength! + index] = 0
            }
            setPlayers(myTeam)
        } else {
            console.log("Can not select more that eleven (11) players")
        }
    }
    const handleViceCaptain = (playerOf: string, index: number) => {
        if (playerOf == "host") {
            setViceCaptainIndex(index)
        } else if (playerOf == "opponent") {
            setViceCaptainIndex(_localTeamSquadLength! + index)
        }
    }
    const handleCaptain = (playerOf: string, index: number) => {
        if (playerOf == "host") {
            setCaptainIndex(index)
        } else if (playerOf == "opponent") {
            setCaptainIndex(_localTeamSquadLength! + index)
        }
    }

    const handleTeamCreation = () => {
        console.log("handleTeamCreation")
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        if (selectedPlayersCount == 11 && _captainIndex != -1 && _viceCaptainIndex != -1) {
            let myTeamPlayers: number[][] = new Array(60)
            const selectedPlayerIdentifier = 1
            for (let i = 0; i < _players.length; ++i) {
                myTeamPlayers[i] = new Array(2)
                if (_players[i] == 1) {
                    myTeamPlayers[i][0] = selectedPlayerIdentifier
                    if (i == _captainIndex) {
                        myTeamPlayers[i][1] = 200
                    } else if (i == _viceCaptainIndex) {
                        myTeamPlayers[i][1] = 150
                    } else {
                        myTeamPlayers[i][1] = 100
                    }
                } else {
                    myTeamPlayers[i][0] = 0
                    myTeamPlayers[i][1] = 100
                }
            }
            const identity = new Identity(_identityString)
            var myTeam: MyTeam = {
                team: myTeamPlayers,
                decimal: 2,
                selectedPlayerIdentifier: selectedPlayerIdentifier,
                matchIdentifier: _matchId,
                secretIdentity: 1 //hardcoding for now
            }
            const myTeamHash = calculateMyTeamHash(myTeam)
            //console.log(myTeamHash)
            console.log("Setting my Team hash : " + myTeamHash)
            setTeamHash(myTeamHash.toString())
            // const myTeamPoseidenHash = calculateMyTeamHash(myTeam)
            const contestState: Contest = {
                matchId: _matchId!.toString(),
                contestId: props.contestId!,
                team: myTeam,
                teamHash: myTeamHash.toString()
            }
            const userContest: UserContestPayload = {
                isPrivateUser: isPrivacyMode,
                identityString: _identityString,
                contest: contestState
            }
            dispatch(addTeamAndTeamHash(userContest))
            props.onClose()
        } else {
            window.alert("Please choose a total of 11 players")
        }
    }
    return (
        <Modal size="2xl" isOpen={props.isOpen} onClose={props.onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Team</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <SimpleGrid columns={2} spacing={4}>
                        <Box>
                            <Text bg="blue" textAlign="center">
                                {props.fixture.localteam.name}({props.localTeamSquad.length}
                            </Text>
                            <List key={"host"} spacing={2}>
                                {props.localTeamSquad.map((player, index) => (
                                    <ListItem
                                        _hover={{
                                            cursor: "pointer"
                                        }}
                                        key={"fsc_" + player.id}
                                    >
                                        <HStack justify="space-around">
                                            <Text w="100%" textAlign="start">
                                                {player.fullname}
                                            </Text>
                                            {_players[index] == 1 ? (
                                                <>
                                                    <ListIcon
                                                        onClick={() => handlePlayerDeSelection("host", index)}
                                                        as={MdCheckCircle}
                                                        color="green.500"
                                                    />
                                                    <Tooltip hasArrow shouldWrapChildren label="Captain">
                                                        {index == _captainIndex ? (
                                                            <ListIcon
                                                                onClick={() => handleCaptain("host", index)}
                                                                as={MdPerson}
                                                                color="blue.500"
                                                            />
                                                        ) : (
                                                            <ListIcon
                                                                onClick={() => handleCaptain("host", index)}
                                                                as={MdPerson}
                                                            />
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip hasArrow shouldWrapChildren label="Vice Captain">
                                                        {index == _viceCaptainIndex ? (
                                                            <ListIcon
                                                                onClick={() => handleViceCaptain("host", index)}
                                                                as={MdPersonOutline}
                                                                color="blue.500"
                                                            />
                                                        ) : (
                                                            <ListIcon
                                                                onClick={() => handleViceCaptain("host", index)}
                                                                as={MdPersonOutline}
                                                            />
                                                        )}
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <ListIcon
                                                    onClick={() => handlePlayerSelection("host", index)}
                                                    as={MdAddCircle}
                                                />
                                            )}
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                        <Box>
                            <Text bg="green" textAlign="center">
                                {props.fixture.visitorteam.name}({props.visitorTeamSquad.length})
                            </Text>
                            <List key={"opponent"} spacing={2}>
                                {props.visitorTeamSquad.map((player, index) => (
                                    <ListItem
                                        _hover={{
                                            cursor: "pointer"
                                        }}
                                        key={"fsc_" + player.id}
                                    >
                                        <HStack justify="space-around">
                                            <Text w="100%" textAlign="start">
                                                {player.fullname}
                                            </Text>
                                            {_players[_localTeamSquadLength! + index] == 1 ? (
                                                <>
                                                    <ListIcon
                                                        onClick={() => handlePlayerDeSelection("opponent", index)}
                                                        as={MdCheckCircle}
                                                        color="green.500"
                                                    />
                                                    <Tooltip hasArrow shouldWrapChildren label="Captain">
                                                        {_localTeamSquadLength! + index == _captainIndex ? (
                                                            <ListIcon
                                                                onClick={() => handleCaptain("opponent", index)}
                                                                as={MdPerson}
                                                                color="blue.500"
                                                            />
                                                        ) : (
                                                            <ListIcon
                                                                onClick={() => handleCaptain("opponent", index)}
                                                                as={MdPerson}
                                                            />
                                                        )}
                                                    </Tooltip>
                                                    <Tooltip hasArrow shouldWrapChildren label="Vice Captain">
                                                        {_localTeamSquadLength! + index == _viceCaptainIndex ? (
                                                            <ListIcon
                                                                onClick={() => handleViceCaptain("opponent", index)}
                                                                as={MdPersonOutline}
                                                                color="blue.500"
                                                            />
                                                        ) : (
                                                            <ListIcon
                                                                onClick={() => handleViceCaptain("opponent", index)}
                                                                as={MdPersonOutline}
                                                            />
                                                        )}
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <ListIcon
                                                    onClick={() => handlePlayerSelection("opponent", index)}
                                                    as={MdAddCircle}
                                                />
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
                    <Button onClick={props.onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default CreateTeam
