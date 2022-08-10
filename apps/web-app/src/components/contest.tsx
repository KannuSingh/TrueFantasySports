import React, { useCallback, useEffect, useState } from "react"
import { scoreAndTeamCalldata } from "../../tfsZkProof/tfs/snarkjsTFS"
import { poseidon } from "circomlibjs"
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
    Tooltip,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    WrapItem,
    useBoolean
} from "@chakra-ui/react"
import { MdCheckCircle, MdAddCircle, MdPerson, MdPersonOutline } from "react-icons/md"
import { useParams } from "react-router-dom"
import { getMatch } from "../data/matches"
import { getSquad } from "../data/squad"
import { getFantasyScorecard } from "../data/fantasyScorecard"
import Contests from "./contests"

import { generateNullifierHash, generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import { getTrueFantasySportContract } from "../walletUtils/MetaMaskUtils"
import detectEthereumProvider from "@metamask/detect-provider"
import { formatBytes32String, parseBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { selectAccount } from "../redux_slices/accountSlice"
import { selectIdentity } from "../redux_slices/identitySlice"
import { useSelector, useDispatch } from "react-redux"
import { MyTeam } from "../utils/MyTeam"
import { calculateMyTeamHash } from "../utils/poseidenUtil"
import { utils } from "ethers"
import { Group } from "@semaphore-protocol/group"
import { addTeamAndTeamHash, Contest, selectUserIdentity } from "../redux_slices/userSlice"
import { useAppDispatch } from "../app/hooks"
import { createSelector } from "@reduxjs/toolkit"

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

function Contest() {
    let params = useParams()
    const _accounts = useSelector(selectAccount)
    let squad: Squad = getSquad(parseInt(params.matchId!, 10))!
    let match: Match = getMatch(parseInt(params.matchId!, 10))!
    const _identityString: string = useSelector(selectUserIdentity)
    const [_identityCommitment, setIdentityCommitment] = useState("")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [_contestId, setContestId] = useState(params.contestId)
    const [_matchId, setMatchId] = useState(params.matchId)
    let contestId = params.contestId
    const [_players, setPlayers] = useState(new Array(30).fill(0))
    const [_captainIndex, setCaptainIndex] = useState(-1)
    const [_viceCaptainIndex, setViceCaptainIndex] = useState(-1)
    const _hostSquadLength = squad.host.length
    const [_participants, setParticipants] = useState<any[]>([])
    let fantasyScorecard: FantasyScoreCard = getFantasyScorecard(parseInt(params.matchId!, 10))!
    const dispatch = useAppDispatch()
    const savedTeam = useSelector((state) => {
        if (state.user.identityString == _identityString) {
            if (state.user.contests.length > 0) {
                const contests = state.user.contests.filter(
                    (contest) => contest.contestId == _contestId && contest.matchId == _matchId
                )
                if (contests.length > 0) {
                    return contests[0].team
                }
            }
        }
    })
    const savedTeamHash = useSelector((state) => {
        if (state.user.identityString == _identityString) {
            if (state.user.contests.length > 0) {
                const contests = state.user.contests.filter(
                    (contest) => contest.contestId == _contestId && contest.matchId == _matchId
                )
                if (contests.length > 0) {
                    return contests[0].teamHash
                }
            }
        }
    })

    //const [myTeams, setMyTeams] = useState<MyTeam[]>([savedTeam])
    const [_myTeamHash, setTeamHash] = useState<string>("")
    const [_loading, setLoading] = useBoolean()
    const [_contestDetails, setContestDetails] = useState<any>()

    const [_latestBlockTimestamp, setLatestBlockTimeStamp] = useState(0)

    const getParticipantList = useCallback(async () => {
        if (_accounts[0]) {
            console.log("Getting contest when Account :" + _accounts[0])
            const ethereum = (await detectEthereumProvider()) as any
            const contract = getTrueFantasySportContract(ethereum)
            const members = await contract.queryFilter(contract.filters.MemberAdded(utils.hexlify(BigInt(_contestId!))))

            return members.map((m) => m.args![1].toString())
        }

        return []
    }, [_accounts])
    const getContestDetails = useCallback(async () => {
        if (_accounts[0]) {
            console.log("Getting contest when Account :" + _accounts[0])
            const ethereum = (await detectEthereumProvider()) as any
            const contract = getTrueFantasySportContract(ethereum)
            const contests = await contract.queryFilter(
                contract.filters.ContestCreated(utils.hexlify(BigInt(_contestId!)))
            )
            if (contests.length == 1) {
                return {
                    contestGroupId: contests[0].args![0].toString(),
                    contestName: parseBytes32String(contests[0].args![1]),
                    matchId: contests[0].args![2].toString(),
                    contestFee: contests[0].args![3].toString(),
                    contestTeamSubmissionEndTime: contests[0].args![4].toString()
                }
            }
        }
    }, [_accounts])
    useEffect(() => {
        ;(async () => {
            if (_identityString != "") {
                const identity = new Identity(_identityString)
                console.log(identity.generateCommitment().toString())
                setIdentityCommitment(identity.generateCommitment().toString())
                const contestDetails = await getContestDetails()
                if (contestDetails != undefined) {
                    setContestDetails(contestDetails)
                    setLatestBlockTimeStamp(await latestBlockTimestamp())
                }
                const participants = await getParticipantList()
                console.log(participants)
                if (participants.length > 0) {
                    setParticipants(participants)
                }
            }
        })()
    }, [_accounts, _identityString])
    const latestBlockTimestamp = async () => {
        const ethereum = (await detectEthereumProvider()) as any
        const latestBlock = (await ethereum.request({
            method: "eth_getBlockByNumber",
            params: ["latest", false]
        })) as { timestamp: string }

        return parseInt(latestBlock.timestamp, 16)
    }
    const handleCreateTeam = () => {
        console.log("handleCreateTeam")
        if (_identityString != "") {
            console.log(_identityString)
            onOpen()
        } else {
            console.log("Idenity String : " + _identityString)
            // log = "Login first to create contest"
        }
        // const ethereum = await detectEthereumProvider()
        // console.log(log)
        //dispatch(requestAccounts(ethereum));
    }
    const handleTeamCreation = () => {
        console.log("handleTeamCreation")
        let selectedPlayersCount = 0
        for (var i = 0; i < _players.length; ++i) {
            if (_players[i] == 1) selectedPlayersCount++
        }
        if (selectedPlayersCount == 11 && _captainIndex != -1 && _viceCaptainIndex != -1) {
            let myTeamPlayers: number[][] = new Array(30)
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
                matchIdentifier: match.id,
                secretIdentity: 1 //hardcoding for now
            }
            const myTeamHash = calculateMyTeamHash(myTeam)
            //console.log(myTeamHash)
            console.log("Setting my Team hash : " + myTeamHash)
            setTeamHash(myTeamHash.toString())
            // const myTeamPoseidenHash = calculateMyTeamHash(myTeam)
            const contestState: Contest = {
                matchId: _matchId!,
                contestId: _contestId!,
                team: myTeam,
                teamHash: myTeamHash.toString()
            }
            dispatch(addTeamAndTeamHash(contestState))
            onClose()
        }
    }
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
                myTeam[_hostSquadLength + index] = 1
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
                myTeam[_hostSquadLength + index] = 0
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
            setViceCaptainIndex(_hostSquadLength + index)
        }
    }
    const handleCaptain = (playerOf: string, index: number) => {
        if (playerOf == "host") {
            setCaptainIndex(index)
        } else if (playerOf == "opponent") {
            setCaptainIndex(_hostSquadLength + index)
        }
    }
    const handleSubmitTeam = async (myTeam: MyTeam) => {
        try {
            setLoading.on()

            const myTeamPoseidenHash = calculateMyTeamHash(savedTeam)

            const myTeamHash = utils.solidityKeccak256(["uint256"], [myTeamPoseidenHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = myTeamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const ethereum = (await detectEthereumProvider()) as any
            const contract = getTrueFantasySportContract(ethereum)
            const treeDepth = Number(process.env.TREE_DEPTH)
            const members = await contract.queryFilter(contract.filters.MemberAdded(utils.hexlify(BigInt(contestId!))))
            const group = new Group()
            group.addMembers(members.map((m) => m.args![1].toString()))
            const participantIdentity = new Identity(_identityString)

            const { proof, publicSignals } = await generateProof(
                participantIdentity,
                group,
                BigInt(contestId!),
                teamIdentifier
            )
            console.log("Proof generation completed .")
            const solidityProof = packToSolidityProof(proof)
            console.log("Solidity Proof " + solidityProof)
            console.log("Sending request to post team")
            const { status } = await fetch(`${process.env.RELAY_URL}/post-team`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: bytes32TeamIdentifier,
                    teamHash: myTeamHash,
                    nullifierHash: publicSignals.nullifierHash,
                    contestId: utils.hexlify(BigInt(contestId!)),
                    solidityProof: solidityProof
                })
            })
            if (status === 200) {
                console.log("Successfully posted team.")
                onClose()
            } else {
                console.log("Some error occurred, please try again!")
            }
            setLoading.off()
        } catch (e) {
            console.log(e)
        }
    }

    const handleContestJoin = async () => {
        try {
            setLoading.on()
            console.log("handleJoinContest")
            const { status } = await fetch(`${process.env.RELAY_URL}/add-member`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contestId: utils.hexlify(BigInt(contestId!)),
                    identityCommitment: _identityCommitment
                })
            })
            if (status === 200) {
                console.log("Successfully added member.")
            } else {
                console.log("Some error occurred, please try again!")
            }
        } catch (e) {
            console.log(e)
        }
        setLoading.off()
    }
    const handleCalcScoreAndGenProof = async () => {
        try {
            setLoading.on()
            console.log("started")

            const myTeam: MyTeam = savedTeam

            console.log(myTeam)
            const playersScoreInMatch: number[] = [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 0, 1, 2, 3, 4, 5, 6, 7
            ]
            const matchIdentifier: bigint = BigInt(myTeam.matchIdentifier)
            const decimal: bigint = BigInt(myTeam.decimal)
            const selectedPlayerIdentifier: bigint = BigInt(myTeam.selectedPlayerIdentifier)
            const secretIdentity: bigint = BigInt(myTeam.secretIdentity)
            const team: any[][] = myTeam.team

            const tfsProof = await scoreAndTeamCalldata(
                playersScoreInMatch,
                matchIdentifier,
                decimal,
                selectedPlayerIdentifier,
                secretIdentity,
                team
            )

            console.log(tfsProof)
            let teamAndScoreInputArray: any[] = []
            teamAndScoreInputArray.push(utils.hexlify(BigInt(tfsProof.Input[0])))
            teamAndScoreInputArray.push(utils.hexlify(BigInt(tfsProof.Input[1])))
            teamAndScoreInputArray.push(tfsProof.Input.slice(2))
            console.log(teamAndScoreInputArray)

            let scoreAndTeamProof: any[] = []
            scoreAndTeamProof.push(tfsProof.a[0])
            scoreAndTeamProof.push(tfsProof.a[1])
            scoreAndTeamProof.push(tfsProof.b[0][0])
            scoreAndTeamProof.push(tfsProof.b[0][1])
            scoreAndTeamProof.push(tfsProof.b[1][0])
            scoreAndTeamProof.push(tfsProof.b[1][1])
            scoreAndTeamProof.push(tfsProof.c[0])
            scoreAndTeamProof.push(tfsProof.c[1])

            console.log("Proof generation completed for team and score.")
            const myTeamHash = utils.solidityKeccak256(["uint256"], [savedTeamHash])

            // teamIdentifier is 31 byte string extracted from teamHash
            const teamIdentifier = myTeamHash.slice(35)

            const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
            const ethereum = (await detectEthereumProvider()) as any
            const contract = getTrueFantasySportContract(ethereum)
            const treeDepth = Number(process.env.TREE_DEPTH)
            const members = await contract.queryFilter(contract.filters.MemberAdded(utils.hexlify(BigInt(contestId!))))
            const group = new Group()
            group.addMembers(members.map((m) => m.args![1].toString()))
            const participantIdentity = new Identity(_identityString)
            const initialNullifierHash = await generateNullifierHash(contestId!, participantIdentity.getNullifier())

            const userNullifierCount = await contract.getUserNullifierCount(utils.hexlify(initialNullifierHash))
            console.log("userNullifierCount : " + userNullifierCount)
            const updateTeamCount = 2
            const externalNullifier =
                BigInt(solidityKeccak256(["uint256", "uint32"], [contestId, userNullifierCount])) >> BigInt(8)

            const { proof, publicSignals } = await generateProof(
                participantIdentity,
                group,
                externalNullifier,
                teamIdentifier
            )
            console.log("semaphore Proof generation completed .")
            const semaphoreSolidityProof = packToSolidityProof(proof)
            console.log("Solidity Proof " + semaphoreSolidityProof)
            console.log(
                JSON.stringify({
                    teamId: bytes32TeamIdentifier,
                    teamHash: myTeamHash,
                    initialNullifierHash: utils.hexlify(BigInt(initialNullifierHash)),
                    nullifierHash: publicSignals.nullifierHash,
                    contestId: utils.hexlify(BigInt(contestId!)),
                    semaphoreSolidityProof: semaphoreSolidityProof,
                    teamAndScoreInputArray: teamAndScoreInputArray,
                    tfsProof: scoreAndTeamProof
                })
            )
            console.log("Sending proof to Submit score...")
            const { status } = await fetch(`${process.env.RELAY_URL}/submit-score`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId: bytes32TeamIdentifier,
                    teamHash: myTeamHash,
                    initialNullifierHash: utils.hexlify(BigInt(initialNullifierHash)),
                    nullifierHash: publicSignals.nullifierHash,
                    contestId: utils.hexlify(BigInt(contestId!)),
                    semaphoreSolidityProof: semaphoreSolidityProof,
                    teamAndScoreInputArray: teamAndScoreInputArray,
                    tfsProof: scoreAndTeamProof
                })
            })
            if (status === 200) {
                console.log("Successfully posted team.")
                window.alert("Score and Proof Submitted Successfully. ")
            } else {
                console.log("Some error occurred, please try again!")
            }
            // }
            setLoading.off()
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <Flex align="center" justify="center">
            <VStack w="60%" spacing={3}>
                <Heading as="h3" size="lg">
                    {match.title}
                </Heading>
                <HStack>
                    <VStack w="100%" spacing={2} alignItems="flex-start">
                        <Text>Host : {match.host}</Text>
                        <Text>Opponent : {match.opponent}</Text>
                        <Text>Date : {match.matchDate}</Text>
                    </VStack>
                    <VStack w="80%" spacing={2} alignItems="flex-start">
                        <Text>Contest Name : {_contestDetails ? _contestDetails.contestName : ""}</Text>
                        <Text>Contest Entry Fee : {_contestDetails ? _contestDetails.contestFee : ""}</Text>
                        <Text>#Participants : {_participants.length}</Text>
                    </VStack>
                    <VStack w="80%" spacing={2} alignItems="flex-start">
                        <Text>
                            Contest Team Submission Ends Time :
                            {_contestDetails
                                ? (
                                      (parseInt(_contestDetails.contestTeamSubmissionEndTime) - _latestBlockTimestamp) /
                                      60
                                  ).toFixed(2)
                                : ""}
                        </Text>
                        <Button
                            isDisabled={_loading || _participants.includes(_identityCommitment)}
                            onClick={handleContestJoin}
                        >
                            {_participants.includes(_identityCommitment) ? "Already Joined" : "Join Contest"}
                        </Button>
                    </VStack>
                </HStack>
                <Tabs w="100%">
                    <TabList justifyContent="space-around">
                        <Tab flexGrow="1">My Team</Tab>
                        <Tab flexGrow="1">Participants</Tab>
                        <Tab flexGrow="1">Leader Board</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            {savedTeam ? (
                                <TableContainer>
                                    <Table size="sm" variant="striped" colorScheme="blue">
                                        <Thead>
                                            <Tr>
                                                <Th>#</Th>
                                                <Th>Team Identiier</Th>

                                                <Th>Action</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            <Tr
                                                //_hover={{
                                                //    cursor: "pointer"
                                                //}}
                                                key={"myTeam_1"}
                                                //onClick={(e) => console.log(savedTeam)}
                                            >
                                                <Td>1</Td>
                                                <Td>{savedTeamHash}</Td>

                                                <Td>
                                                    <Tooltip
                                                        hasArrow
                                                        label={
                                                            !_participants.includes(_identityCommitment)
                                                                ? "First Join Contest"
                                                                : ""
                                                        }
                                                        shouldWrapChildren
                                                        mt="3"
                                                    >
                                                        <Button
                                                            colorScheme="green"
                                                            isDisabled={
                                                                !_participants.includes(_identityCommitment) || _loading
                                                            }
                                                            onClick={() => handleSubmitTeam(savedTeam)}
                                                        >
                                                            Submit Team
                                                        </Button>
                                                    </Tooltip>
                                                </Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <HStack justifyContent="space-between">
                                    <p>No team submitted for this contest </p>
                                    <Button onClick={handleCreateTeam} colorScheme="green">
                                        Create Team
                                    </Button>
                                </HStack>
                            )}
                            <Modal size="xl" isOpen={isOpen} onClose={onClose}>
                                <ModalOverlay />
                                <ModalContent>
                                    <ModalHeader>Create Team</ModalHeader>
                                    <ModalCloseButton />
                                    <ModalBody>
                                        <SimpleGrid columns={2} spacing={4}>
                                            <Box>
                                                <Text bg="blue" textAlign="center">
                                                    {match.host}
                                                </Text>
                                                <List key={"host"} spacing={2}>
                                                    {squad.host.map((playerName, index) => (
                                                        <ListItem
                                                            _hover={{
                                                                cursor: "pointer"
                                                            }}
                                                            key={"fsc_" + playerName + index}
                                                        >
                                                            <HStack justify="space-around">
                                                                <Text w="100%" textAlign="start">
                                                                    {playerName}
                                                                </Text>
                                                                {_players[index] == 1 ? (
                                                                    <>
                                                                        <ListIcon
                                                                            onClick={() =>
                                                                                handlePlayerDeSelection("host", index)
                                                                            }
                                                                            as={MdCheckCircle}
                                                                            color="green.500"
                                                                        />
                                                                        <Tooltip
                                                                            hasArrow
                                                                            shouldWrapChildren
                                                                            label="Captain"
                                                                        >
                                                                            {index == _captainIndex ? (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleCaptain("host", index)
                                                                                    }
                                                                                    as={MdPerson}
                                                                                    color="blue.500"
                                                                                />
                                                                            ) : (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleCaptain("host", index)
                                                                                    }
                                                                                    as={MdPerson}
                                                                                />
                                                                            )}
                                                                        </Tooltip>
                                                                        <Tooltip
                                                                            hasArrow
                                                                            shouldWrapChildren
                                                                            label="Vice Captain"
                                                                        >
                                                                            {index == _viceCaptainIndex ? (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleViceCaptain("host", index)
                                                                                    }
                                                                                    as={MdPersonOutline}
                                                                                    color="blue.500"
                                                                                />
                                                                            ) : (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleViceCaptain("host", index)
                                                                                    }
                                                                                    as={MdPersonOutline}
                                                                                />
                                                                            )}
                                                                        </Tooltip>
                                                                    </>
                                                                ) : (
                                                                    <ListIcon
                                                                        onClick={() =>
                                                                            handlePlayerSelection("host", index)
                                                                        }
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
                                                    {match.opponent}
                                                </Text>
                                                <List key={"opponent"} spacing={2}>
                                                    {squad.opponent.map((playerName, index) => (
                                                        <ListItem
                                                            _hover={{
                                                                cursor: "pointer"
                                                            }}
                                                            key={"fsc_" + playerName + index}
                                                        >
                                                            <HStack justify="space-around">
                                                                <Text w="100%" textAlign="start">
                                                                    {playerName}
                                                                </Text>
                                                                {_players[_hostSquadLength + index] == 1 ? (
                                                                    <>
                                                                        <ListIcon
                                                                            onClick={() =>
                                                                                handlePlayerDeSelection(
                                                                                    "opponent",
                                                                                    index
                                                                                )
                                                                            }
                                                                            as={MdCheckCircle}
                                                                            color="green.500"
                                                                        />
                                                                        <Tooltip
                                                                            hasArrow
                                                                            shouldWrapChildren
                                                                            label="Captain"
                                                                        >
                                                                            {_hostSquadLength + index ==
                                                                            _captainIndex ? (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleCaptain("opponent", index)
                                                                                    }
                                                                                    as={MdPerson}
                                                                                    color="blue.500"
                                                                                />
                                                                            ) : (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleCaptain("opponent", index)
                                                                                    }
                                                                                    as={MdPerson}
                                                                                />
                                                                            )}
                                                                        </Tooltip>
                                                                        <Tooltip
                                                                            hasArrow
                                                                            shouldWrapChildren
                                                                            label="Vice Captain"
                                                                        >
                                                                            {_hostSquadLength + index ==
                                                                            _viceCaptainIndex ? (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleViceCaptain(
                                                                                            "opponent",
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    as={MdPersonOutline}
                                                                                    color="blue.500"
                                                                                />
                                                                            ) : (
                                                                                <ListIcon
                                                                                    onClick={() =>
                                                                                        handleViceCaptain(
                                                                                            "opponent",
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    as={MdPersonOutline}
                                                                                />
                                                                            )}
                                                                        </Tooltip>
                                                                    </>
                                                                ) : (
                                                                    <ListIcon
                                                                        onClick={() =>
                                                                            handlePlayerSelection("opponent", index)
                                                                        }
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
                                        <Button onClick={onClose}>Close</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </TabPanel>
                        <TabPanel>
                            <TableContainer>
                                <Table size="md" variant="striped" colorScheme="teal">
                                    <Thead>
                                        <Tr>
                                            <Th>#</Th>
                                            <Th>Participant commitmentId</Th>

                                            <Th>Participant Team Hash</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {_participants.map((participant, index) => (
                                            <Tr key={"participant_" + index}>
                                                <Td>{index + 1}</Td>
                                                <Td>
                                                    <Text>{participant.toString().substring(0, 15) + "..."}</Text>
                                                </Td>
                                                <Td>#</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </TabPanel>
                        <TabPanel>
                            <p>LeaderBoard</p>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <Button onClick={handleCalcScoreAndGenProof}>Calculate Score and Generate Proof</Button>
            </VStack>
        </Flex>
    )
}

export default Contest
