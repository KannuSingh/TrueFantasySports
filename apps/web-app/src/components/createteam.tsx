import React, { useState } from "react"
import {
    Box,
    Text,
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
    ListIcon,
    Tooltip,
    Alert,
    AlertIcon
} from "@chakra-ui/react"
import { MdCheckCircle, MdAddCircle, MdPerson, MdPersonOutline } from "react-icons/md"

import { Identity } from "@semaphore-protocol/identity"
import { selectAccounts } from "../redux_slices/accountSlice"
import { selectCurrentIdentity } from "../redux_slices/identitySlice"
import { useSelector, useDispatch } from "react-redux"
import { MyTeam } from "../utils/MyTeam"
import { Fixture, SquadInfo } from "../models/model"
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

    const [_players, setPlayers] = useState(new Array(60).fill(0))
    const [_matchId, setMatchId] = useState(props.fixture.id)
    const [_captainIndex, setCaptainIndex] = useState(-1)
    const [_viceCaptainIndex, setViceCaptainIndex] = useState(-1)
    const _localTeamSquadLength = props.localTeamSquad.length
    const [_myTeamHash, setTeamHash] = useState<string>("")
    const [_errorLog, setErrorLog] = useState<string>("")
    const dispatch = useAppDispatch()

    const handlePlayerSelection = (playerOf: string, index: number) => {
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        console.log("selected Player count : ", selectedPlayersCount)
        if (selectedPlayersCount < 11) {
            let myTeam = [..._players]
            if (playerOf == "host") {
                myTeam[index] = 1
            } else if (playerOf == "opponent") {
                myTeam[_localTeamSquadLength! + index] = 1
            }
            setPlayers(myTeam)
        } else {
            setErrorLog("Can not select more that eleven (11) players")
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
            setErrorLog("Can not select more that eleven (11) players")
        }
    }
    const handleViceCaptain = (playerOf: string, index: number) => {
        if (playerOf == "host") {
            if (index == _captainIndex) {
                setCaptainIndex(-1)
            }
            setViceCaptainIndex(index)
        } else if (playerOf == "opponent") {
            if (_localTeamSquadLength + index == _captainIndex) {
                setCaptainIndex(-1)
            }
            setViceCaptainIndex(_localTeamSquadLength! + index)
        }
    }
    const handleCaptain = (playerOf: string, index: number) => {
        if (playerOf == "host") {
            if (index == _viceCaptainIndex) {
                setViceCaptainIndex(-1)
            }
            setCaptainIndex(index)
        } else if (playerOf == "opponent") {
            if (_localTeamSquadLength + index == _viceCaptainIndex) {
                setViceCaptainIndex(-1)
            }
            setCaptainIndex(_localTeamSquadLength + index)
        }
    }

    const handleTeamCreation = () => {
        console.log("handleTeamCreation")
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        if (selectedPlayersCount == 11) {
            if (_captainIndex != -1 && _viceCaptainIndex != -1) {
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

                console.log("Setting my Team hash : " + myTeamHash)
                setTeamHash(myTeamHash.toString())

                const contestState: Contest = {
                    matchId: _matchId!.toString(),
                    contestId: props.contestId!,
                    team: myTeam,
                    teamHash: myTeamHash.toString()
                }
                const userContest: UserContestPayload = {
                    isPrivateUser: isPrivacyMode,
                    identityString: isPrivacyMode ? _identityString : _accounts[0],
                    contest: contestState
                }
                dispatch(addTeamAndTeamHash(userContest))
                props.onClose()
            } else {
                setErrorLog("Please select Captain and ViceCaptain both.")
            }
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
                    {_errorLog != "" ? (
                        <Alert status="error">
                            <AlertIcon />
                            {_errorLog}
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <SimpleGrid columns={2} spacing={4}>
                        <Box>
                            <Text bg="blue" textAlign="center">
                                {props.fixture.localteam.name}({props.localTeamSquad.length})
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
                        Create Team
                    </Button>
                    <Button onClick={props.onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default CreateTeam
