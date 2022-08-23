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
    useBoolean,
    Spinner,
    Box
} from "@chakra-ui/react"
import { Contract, utils } from "ethers"
import {
    getTFSTokenContract,
    getTrueFantasySportContract,
    getTrueFantasySportV1Contract
} from "../walletUtils/MetaMaskUtils"
import { useSelector } from "react-redux"
import detectEthereumProvider from "@metamask/detect-provider"
import { selectAccount } from "../redux_slices/accountSlice"
import { formatBytes32String, parseBytes32String } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { useNavigate } from "react-router-dom"
import { selectUserIdentity } from "../redux_slices/userSlice"
import { RootState } from "../app/store"

function Contests(props: { matchId: number | undefined; handleContestClick }) {
    const _accounts: string[] = useSelector(selectAccount)
    const { isOpen: isOpenCreateAndJoinContest, onOpen, onClose: onCreateAndJoinContestModalClose } = useDisclosure()
    const [_loading, setLoading] = useBoolean()

    const [_log, setLog] = useState("")
    const _identityString: string = useSelector(selectUserIdentity)
    const [_contests, setContests] = useState<any[]>([])
    const [_contestName, setContestName] = useState("")
    const [_contestEntryFee, setContestEntryFee] = useState(0)
    const [_teamSubmissionDeadline, setTeamSubmittionDeadline] = useState(0)
    const [_identityCommitment, setIdentityCommitment] = useState("")
    const [_latestBlockTimestamp, setLatestBlockTimeStamp] = useState(0)
    const [_contestCompletionTime, setContestCompletionTime] = useState(0)
    const [_trueFantasySportsContract, setTrueFantasySportsContract] = useState<Contract>()
    const [_trueFantasySportsV1Contract, setTrueFantasySportsV1Contract] = useState<Contract>()
    const [_tfsTokenContract, setTFSTokenContract] = useState<Contract>()
    const isTransactionPrivacy = useSelector((state: RootState) => state.transactionPrivacy)

    const getTFSContests = useCallback(async () => {
        console.log("getTFSContests when Account :" + _accounts[0])

        const ethereum = (await detectEthereumProvider()) as any
        const contract = getTrueFantasySportContract(ethereum)
        const contests = await contract!.queryFilter(
            contract!.filters.ContestCreated(null, null, utils.hexlify(BigInt(props.matchId!)))
        )
        console.log("_contests", contests)
        const members = await contract!.queryFilter(contract!.filters.MemberAdded())
        // console.log("Contests : " + contests)
        // console.log("Members : " + members)
        return contests.map((e) => ({
            contestGroupId: e.args![0].toString(),
            contestName: parseBytes32String(e.args![1]),
            matchId: e.args![2].toString(),
            contestFee: parseInt(e.args![3].toString()) / 10 ** 18,
            contestTeamSubmissionEndTime: e.args![4].toString(),
            members: members.filter((m) => m.args![0].eq(e.args![0])).map((m) => m.args![1].toString())
        }))

        return []
    }, [_accounts])

    const getTFSV1Contests = useCallback(async () => {
        console.log("getTFSV1Contests contest when Account :" + _accounts[0])

        const ethereum = (await detectEthereumProvider()) as any
        const contract = getTrueFantasySportV1Contract(ethereum)

        const contests = await contract!.queryFilter(
            contract!.filters.ContestCreated(null, null, utils.hexlify(BigInt(props.matchId!)))
        )
        console.log("got the contract")
        console.log("_contests", contests)
        const members = await contract!.queryFilter(contract!.filters.MemberAdded())
        // console.log("Contests : " + contests)
        console.log(members)
        return contests.map((e) => ({
            contestGroupId: e.args![0].toString(),
            contestName: parseBytes32String(e.args![1]),
            matchId: e.args![2].toString(),
            contestFee: parseInt(e.args![3].toString()) / 10 ** 18,
            contestTeamSubmissionEndTime: e.args![4].toString(),
            members: members.filter((m) => m.args![0].eq(e.args![0])).map((m) => m.args![1].toString())
        }))

        return []
    }, [_accounts])

    useEffect(() => {
        ;(async () => {
            const ethereum = (await detectEthereumProvider()) as any
            const tfsContract = getTrueFantasySportContract(ethereum)
            const tfsV1Contract = getTrueFantasySportV1Contract(ethereum)
            const tfsTokenContract = getTFSTokenContract(ethereum)
            setTrueFantasySportsContract(tfsContract)
            setTrueFantasySportsV1Contract(tfsV1Contract)
            setTFSTokenContract(tfsTokenContract)

            if (_accounts[0]) {
                let contests: any[] = []
                if (isTransactionPrivacy) {
                    contests = await getTFSContests()
                } else {
                    contests = await getTFSV1Contests()
                }
                console.log("contest", contests)
                setContests(contests)
                setLatestBlockTimeStamp(await latestBlockTimestamp())
            }
        })()
    }, [_accounts, _identityString, isTransactionPrivacy])

    const handleCreateContest = async () => {
        if (isTransactionPrivacy && _identityString != "") {
            onOpen()
        } else if (!isTransactionPrivacy) {
            onOpen()
        } else {
            window.alert("In privacy mode : To create contest, please login...")
        }
    }

    const handleContestCreation = async () => {
        setLoading.on()
        try {
            if (
                _contestName != "" &&
                _contestEntryFee > 0 &&
                _teamSubmissionDeadline >= 0 &&
                _contestCompletionTime >= 0 &&
                _contestCompletionTime >= _teamSubmissionDeadline
            ) {
                const ethereum = (await detectEthereumProvider()) as any
                const latestBlock = (await ethereum.request({
                    method: "eth_getBlockByNumber",
                    params: ["latest", false]
                })) as { timestamp: string }

                const latestBlockTimestamp = parseInt(latestBlock.timestamp, 16)

                const teamSubmittionDeadline_IN_SECS = utils.hexlify(
                    BigInt(latestBlockTimestamp + _teamSubmissionDeadline * 60)
                )
                const contestCompletionTime_IN_SECS = utils.hexlify(
                    BigInt(latestBlockTimestamp + _contestCompletionTime * 60)
                )
                const entryFee = utils.hexlify(BigInt(_contestEntryFee * 10 ** 18))
                const matchId = utils.hexlify(BigInt(props.matchId!))
                const contestName = formatBytes32String(_contestName)
                if (isTransactionPrivacy) {
                    if (_identityString != "" && props.matchId) {
                        const identity = new Identity(_identityString)
                        const participantIdentityCommitment = identity.generateCommitment().toString()
                        setLog("Waiting for contest creation transaction completion...")
                        const { status } = await fetch(`${process.env.RELAY_URL}/api/create-contest`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                contestName: contestName,
                                identityCommitment: participantIdentityCommitment,
                                contestEntryFee: entryFee,
                                contestCompletionTime: contestCompletionTime_IN_SECS,
                                teamSubmissionDeadline: teamSubmittionDeadline_IN_SECS,
                                matchId: matchId
                            })
                        })
                        if (status === 200) {
                            setLog("Successfully created a Contest...")
                            setLog("Loading Contests...")
                            _trueFantasySportsContract!.on(
                                "ContestCreated",
                                (
                                    contestGroupId,
                                    contestName,
                                    matchId,
                                    contestFee,
                                    contestTeamSubmissionEndTime,
                                    contestCompletionTime
                                ) => {
                                    const newContest = {
                                        contestGroupId: contestGroupId.toString(),
                                        contestName: parseBytes32String(contestName),
                                        matchId: matchId.toString(),
                                        contestFee: parseInt(contestFee.toString()) / 10 ** 18,
                                        contestTeamSubmissionEndTime: contestTeamSubmissionEndTime.toString(),
                                        contestCompletionTime: contestCompletionTime.toString(),
                                        members: [participantIdentityCommitment]
                                    }
                                    let contests = [..._contests, newContest]
                                    setContests(contests)
                                }
                            )
                        } else {
                            console.log("Some error occurred, please try again!")
                        }
                    }
                } else {
                    setLog("Waiting for entry fee amount approval from user...")
                    const tokenApprovalTransaction = await _tfsTokenContract!.approve(
                        process.env.TFS_V1_CONTRACT_ADDRESS,
                        entryFee
                    )
                    setLog("Waiting for approved amount transaction confirmation...")
                    await tokenApprovalTransaction.wait()
                    setLog("Waiting for create contest transaction approval from user...")
                    const createContestTransaction = await _trueFantasySportsV1Contract!.createContest(
                        contestName,
                        matchId,
                        teamSubmittionDeadline_IN_SECS,
                        contestCompletionTime_IN_SECS,
                        entryFee
                    )
                    setLog("Waiting for create contest transaction confirmation...")
                    await createContestTransaction.wait()
                    setLog("Successfully created a Contest. Loading Contests...")

                    _trueFantasySportsV1Contract!.on(
                        "ContestCreated",
                        (
                            contestGroupId,
                            contestName,
                            matchId,
                            contestFee,
                            contestTeamSubmissionEndTime,
                            contestCompletionTime
                        ) => {
                            const newContest = {
                                contestGroupId: contestGroupId.toString(),
                                contestName: parseBytes32String(contestName),
                                matchId: matchId.toString(),
                                contestFee: parseInt(contestFee.toString()) / 10 ** 18,
                                contestTeamSubmissionEndTime: contestTeamSubmissionEndTime.toString(),
                                contestCompletionTime: contestCompletionTime.toString(),
                                members: [_accounts[0]]
                            }
                            let contests = [..._contests, newContest]
                            setContests(contests)
                        }
                    )
                    console.log("Success creating contest request")
                }
                onCreateAndJoinContestModalClose()
            } else {
                window.alert("please enter all required fields.")
            }
        } catch (e) {
            console.log(e)
        }
        setLoading.off()
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
            {_loading ? (
                <>
                    <HStack justifyContent="center">
                        <Spinner size="xl" />
                        <Text>{_log}</Text>
                    </HStack>
                </>
            ) : (
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
                                                    cursor: "pointer",
                                                    fontWeight: "semibold"
                                                }}
                                                key={"contest_" + contest.contestGroupId + index}
                                                onClick={(e) => props.handleContestClick(contest.contestGroupId)}
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
                                        <Text>Contest Completion Time(in Minutes)</Text>
                                        <Input
                                            htmlSize={25}
                                            width="auto"
                                            type="number"
                                            placeholder="Contest Completion Time"
                                            value={_contestCompletionTime}
                                            required
                                            onChange={(e) => setContestCompletionTime(e.target.valueAsNumber)}
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
            )}
        </>
    )
}

export default Contests
