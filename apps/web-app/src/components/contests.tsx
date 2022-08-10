import React, { useCallback, useEffect, useState } from "react"
import {
    Text,
    VStack,
    Table,
    TableContainer,
    HStack,
    SimpleGrid,
    Button,
    Modal,
    ModalOverlay,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    Input,
    ModalFooter,
    useDisclosure,
    ModalContent,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    useBoolean
} from "@chakra-ui/react"
import { getTrueFantasySportContract } from "../walletUtils/MetaMaskUtils"
import { useSelector } from "react-redux"
import detectEthereumProvider from "@metamask/detect-provider"
import { selectAccount } from "../redux_slices/accountSlice"
import { formatBytes32String, parseBytes32String } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { useNavigate } from "react-router-dom"
import { selectUserIdentity } from "../redux_slices/userSlice"

function Contests(props: { matchId: string | undefined }) {
    const _accounts = useSelector(selectAccount)
    const { isOpen: isOpenCreateAndJoinContest, onOpen, onClose: onCreateAndJoinContestModalClose } = useDisclosure()
    const [_loading, setLoading] = useBoolean()
    //const _loggedIn = useSelector(selectLoggedIn);
    const navigate = useNavigate()
    let log = ""
    const _identityString: string = useSelector(selectUserIdentity)
    const [_contests, setContests] = useState<any[]>([])
    const [_contestName, setContestName] = useState("")
    const [_contestEntryFee, setContestEntryFee] = useState(0)
    const [_teamSubmissionDeadline, setTeamSubmittionDeadline] = useState(0)
    const [_identityCommitment, setIdentityCommitment] = useState("")
    const [_latestBlockTimestamp, setLatestBlockTimeStamp] = useState(0)

    const getContests = useCallback(async () => {
        if (_accounts[0]) {
            console.log("Getting contest when Account :" + _accounts[0])
            const ethereum = (await detectEthereumProvider()) as any
            const contract = getTrueFantasySportContract(ethereum)
            const contests = await contract.queryFilter(contract.filters.ContestCreated())
            const members = await contract.queryFilter(contract.filters.MemberAdded())
            // console.log("Contests : " + contests)
            // console.log("Members : " + members)
            return contests.map((e) => ({
                contestGroupId: e.args![0].toString(),
                contestName: parseBytes32String(e.args![1]),
                matchId: e.args![2].toString(),
                contestFee: e.args![3].toString(),
                contestTeamSubmissionEndTime: e.args![4].toString(),
                members: members.filter((m) => m.args![0].eq(e.args![0])).map((m) => m.args![1].toString())
            }))
        }

        return []
    }, [_accounts])
    useEffect(() => {
        ;(async () => {
            if (_identityString != "") {
                const identity = new Identity(_identityString)
                // console.log(identity.generateCommitment().toString())
                setIdentityCommitment(identity.generateCommitment().toString())
                const contests = await getContests()
                console.log(contests)
                if (contests.length > 0) {
                    setContests(contests)
                    setLatestBlockTimeStamp(await latestBlockTimestamp())
                }
            }
        })()
    }, [_accounts, _identityString])

    const handleCreateContest = async () => {
        if (_identityString != "") {
            onOpen()
        } else {
            window.alert("To create contest, please login...")
        }
    }
    const handleContestCreation = async () => {
        setLoading.on()
        if (
            _identityString != "" &&
            props.matchId != "" &&
            _contestName != "" &&
            _contestEntryFee > 0 &&
            _teamSubmissionDeadline >= 10
        ) {
            // const identity = new Identity(_identityString)
            const ethereum = (await detectEthereumProvider()) as any
            const latestBlock = (await ethereum.request({
                method: "eth_getBlockByNumber",
                params: ["latest", false]
            })) as { timestamp: string }

            const latestBlockTimestamp = parseInt(latestBlock.timestamp, 16)
            const participantIdentityCommitment = _identityCommitment // identity.generateCommitment().toString()
            const teamSubmittionDeadline_IN_SECS = latestBlockTimestamp + _teamSubmissionDeadline * 60
            const entryFee = _contestEntryFee
            const matchId = parseInt(props.matchId!)
            const contestName = formatBytes32String(_contestName)
            console.log("latest blocktimestamp" + latestBlockTimestamp)
            console.log("Team deadline :" + teamSubmittionDeadline_IN_SECS)

            const { status } = await fetch(`${process.env.RELAY_URL}/create-contest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contestName: contestName,
                    identityCommitment: participantIdentityCommitment,
                    contestEntryFee: entryFee,
                    teamSubmissionDeadline: teamSubmittionDeadline_IN_SECS,
                    matchId: matchId
                })
            })
            if (status === 200) {
                console.log("Successfully created a Contest.")
                onCreateAndJoinContestModalClose()
            } else {
                console.log("Some error occurred, please try again!")
            }
        } else {
            log = "Login first to create contest"
        }
        setLoading.off()
    }

    const handleContestClick = (contestId: string) => {
        console.log("handleContestClick")

        navigate(`/matches/${props.matchId}/contests/${contestId}`)
    }
    const latestBlockTimestamp = async () => {
        const ethereum = (await detectEthereumProvider()) as any
        const latestBlock = (await ethereum.request({
            method: "eth_getBlockByNumber",
            params: ["latest", false]
        })) as { timestamp: string }

        return parseInt(latestBlock.timestamp, 16)
    }
    return (
        <>
            {_contests.length > 0 ? (
                <>
                    <HStack justifyContent="end">
                        <Button isDisabled={_loading} onClick={handleCreateContest} colorScheme="green">
                            Create Contest
                        </Button>
                    </HStack>
                    <TableContainer>
                        <Table size="sm" variant="striped" colorScheme="teal">
                            <Thead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Contest Name</Th>
                                    <Th isNumeric>Entry Fee</Th>
                                    <Th isNumeric>#Participants</Th>
                                    <Th isNumeric>Team Submission Ends In</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {_contests.map((contest, index) => (
                                    <Tr
                                        _hover={{
                                            cursor: "pointer"
                                        }}
                                        key={"contest_" + contest.contestGroupId + index}
                                        onClick={(e) => handleContestClick(contest.contestGroupId)}
                                    >
                                        <Td>{index + 1}</Td>
                                        <Td>{contest.contestName}</Td>
                                        <Td isNumeric>{contest.contestFee}</Td>
                                        <Td isNumeric>{contest.members.length}</Td>
                                        <Td isNumeric>
                                            {(
                                                (parseInt(contest.contestTeamSubmissionEndTime) -
                                                    _latestBlockTimestamp) /
                                                60
                                            ).toFixed(2)}
                                            mins
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </>
            ) : (
                <HStack justifyContent="space-between">
                    <p>No contests available for this match </p>
                    <Button isDisabled={_loading} onClick={handleCreateContest} colorScheme="green">
                        Create Contest
                    </Button>
                </HStack>
            )}

            <Modal isOpen={isOpenCreateAndJoinContest} onClose={onCreateAndJoinContestModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create Contest</ModalHeader>
                    <ModalCloseButton isDisabled={_loading} />
                    <ModalBody justifyContent="start">
                        <VStack alignItems="start">
                            <SimpleGrid columns={2} spacing={4}>
                                <Text>Match Id</Text>
                                <Input
                                    htmlSize={25}
                                    width="auto"
                                    placeholder="Enter Contest Fee"
                                    value={props.matchId}
                                    required
                                    disabled
                                />
                            </SimpleGrid>

                            <SimpleGrid columns={2} spacing={4}>
                                <Text>Contest Name</Text>
                                <Input
                                    htmlSize={25}
                                    width="auto"
                                    placeholder="Enter Contest Name "
                                    value={_contestName}
                                    required
                                    onChange={(e) => setContestName(e.target.value)}
                                />
                            </SimpleGrid>
                            <SimpleGrid columns={2} spacing={4}>
                                <Text>Team Submission Deadline (in Minutes)</Text>
                                <Input
                                    htmlSize={25}
                                    width="auto"
                                    type="number"
                                    placeholder="Team Submission Deadline"
                                    value={_teamSubmissionDeadline}
                                    required
                                    onChange={(e) => setTeamSubmittionDeadline(e.target.valueAsNumber)}
                                />
                            </SimpleGrid>
                            <SimpleGrid columns={2} spacing={4}>
                                <Text>Contest Entry Fee</Text>
                                <Input
                                    htmlSize={25}
                                    width="auto"
                                    type="number"
                                    placeholder="Enter Contest Fee"
                                    value={_contestEntryFee}
                                    required
                                    onChange={(e) => setContestEntryFee(e.target.valueAsNumber)}
                                />
                            </SimpleGrid>
                        </VStack>
                    </ModalBody>

                    <ModalFooter justifyContent="center">
                        <Button isDisabled={_loading} mr={3} colorScheme="blue" onClick={handleContestCreation}>
                            Create and Join
                        </Button>
                        <Button isDisabled={_loading} onClick={onCreateAndJoinContestModalClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default Contests
