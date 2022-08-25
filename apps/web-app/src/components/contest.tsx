import React, { useCallback, useEffect, useState } from "react"
import { scoreAndTeamCalldata } from "../../tfsZkProof/tfs/snarkjsTFS"
import {
    Text,
    VStack,
    Heading,
    Tabs,
    Tab,
    TabPanel,
    TabPanels,
    TabList,
    HStack,
    Button,
    useDisclosure,
    Tooltip,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    useBoolean,
    Divider,
    Image,
    Spinner,
    Alert,
    AlertIcon
} from "@chakra-ui/react"
import { useLocation, useParams } from "react-router-dom"
import { generateNullifierHash, generateProof, packToSolidityProof } from "@semaphore-protocol/proof"
import {
    getTFSTokenContract,
    getTrueFantasySportContract,
    getTrueFantasySportV1Contract
} from "../walletUtils/MetaMaskUtils"
import detectEthereumProvider from "@metamask/detect-provider"
import { formatBytes32String, parseBytes32String, solidityKeccak256 } from "ethers/lib/utils"
import { Identity } from "@semaphore-protocol/identity"
import { selectAccounts } from "../redux_slices/accountSlice"
import { useSelector } from "react-redux"
import { MyTeam } from "../utils/MyTeam"
import { calculateMyTeamHash } from "../utils/poseidenUtil"
import { Contract, Event, utils } from "ethers"
import { Group } from "@semaphore-protocol/group"
import { Contest, selectUsersDetails } from "../redux_slices/userSlice"
import { Fixture, SeasonTeam, SquadInfo } from "../models/model"
import { getSimpleDate } from "../utils/commonUtils"
import CreateTeam from "./createteam"
import ViewMyTeam from "./viewMyTeam"
import FantasyScorecard from "./fantasyScorecard"
import { selectPrivacyMode } from "../redux_slices/transactionPrivacySlice"
import { selectCurrentIdentity } from "../redux_slices/identitySlice"
import { useAppDispatch } from "../app/hooks"

interface ContestParams {
    fixture: Fixture
    localTeam: SeasonTeam
    visitorTeam: SeasonTeam
}

function Contest() {
    let params = useParams()

    let state: ContestParams = useLocation()!.state!
    const dispatch = useAppDispatch()
    const { fixture, localTeam, visitorTeam } = state
    const [_log, setLog] = useState("")
    const _contestId = params.contestId
    const _matchId = fixture.id
    const [_localTeamSquad, setLocalTeamSquad] = useState<SquadInfo[]>([])
    const [_visitorTeamSquad, setVisitorTeamSquad] = useState<SquadInfo[]>([])
    const _accounts: string[] = useSelector(selectAccounts)
    const _identityString: string = useSelector(selectCurrentIdentity)
    const [_identityCommitment, setIdentityCommitment] = useState("")
    const { isOpen: isCreateTeamOpen, onOpen: onCreateTeamOpen, onClose: onCreateTeamClose } = useDisclosure()
    const { isOpen: isViewTeamOpen, onOpen: onViewTeamOpen, onClose: onViewTeamClose } = useDisclosure()
    const [_participants, setParticipants] = useState<any[]>([])
    const [_participantsWithTeam, setParticipantsWithTeam] = useState<any[]>([])
    const [_yourScore, setYourScore] = useState(0)
    const [_highestScore, setHighestScore] = useState(0)
    const [_fantasyScorecard, setFantasyScorecard] = useState<number[]>([])
    const [_loading, setLoading] = useBoolean()
    const [_contestDetails, setContestDetails] = useState<any>()
    const [_isUserSubmittedTeam, setUserSubmittedTeam] = useState<boolean>()
    const isPrivacyMode = useSelector(selectPrivacyMode)
    const [_isContestPrizeClaimed, setContestPrizeClaimed] = useState<boolean>()
    const [_latestBlockTimestamp, setLatestBlockTimeStamp] = useState(0)

    const getSavedTeamHash = (isPrivateUser: boolean, identityString: string, contestId: string, matchId: string) => {
        const userDetails = useSelector(selectUsersDetails)
        const users = userDetails.filter(
            (user) => user.identityString == identityString && user.isPrivateUser == isPrivateUser
        )
        if (users.length == 1) {
            //check if contestToUpdate already exist/joined
            const userContests = users[0]!.contests.filter(
                (contest) => contest.matchId == matchId && contest.contestId == contestId
            )
            if (userContests.length == 1) {
                return userContests[0].teamHash
            }
        }
        return ""
    }
    const getSavedTeam = (isPrivateUser: boolean, identityString: string, contestId: string, matchId: string) => {
        const userDetails = useSelector(selectUsersDetails)
        const users = userDetails.filter(
            (user) => user.identityString == identityString && user.isPrivateUser == isPrivateUser
        )
        if (users.length == 1) {
            //check if contestToUpdate already exist/joined
            const userContests = users[0]!.contests.filter(
                (contest) => contest.matchId == matchId && contest.contestId == contestId
            )
            if (userContests.length == 1) {
                return userContests[0].team
            }
        }
        return null
    }
    const getCurrentUserIdentity = () => {
        return isPrivacyMode ? _identityString : _accounts[0]
    }
    const savedTeamHash = getSavedTeamHash(isPrivacyMode, getCurrentUserIdentity(), _contestId!, _matchId.toString())
    const savedTeam = getSavedTeam(isPrivacyMode, getCurrentUserIdentity(), _contestId!, _matchId.toString())

    const getParticipantList = useCallback(async () => {
        console.log("Getting contest when Account :" + _accounts[0])
        const ethereum = (await detectEthereumProvider()) as any
        let contract: Contract | null = null
        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
        }
        const members = await contract.queryFilter(contract.filters.MemberAdded(utils.hexlify(BigInt(_contestId!))))

        return members.map((m) => m.args![2].toString().toLowerCase())
    }, [_accounts, isPrivacyMode])
    const isContestPrizeClaimed = async () => {
        console.log("Getting claim prize status when Account :" + _accounts[0])
        const ethereum = (await detectEthereumProvider()) as any
        let contract: Contract | null = null
        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
        }
        const claimedPrized = await contract.queryFilter(
            contract.filters.ClaimedPrize(utils.hexlify(BigInt(_contestId!)))
        )
        if (claimedPrized.length > 0) {
            return true
        }
        return false
    }

    const getParticipantWithTeamList = useCallback(async () => {
        console.log("Getting contest when Account :" + _accounts[0])
        const ethereum = (await detectEthereumProvider()) as any
        let members: Event[] = []
        let contract: Contract | null = null
        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
            //need changes in contract code
            //members = await contract.queryFilter(contract.filters.TeamPosted(utils.hexlify(BigInt(_contestId!))))
            return []
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
            members = await contract.queryFilter(contract.filters.TeamPosted(utils.hexlify(BigInt(_contestId!))))
            return members.map((m) => ({
                contestId: m.args![0],
                memberUID: m.args![1].toString().toLowerCase(),
                teamHash: m.args![2]
            }))
        }
    }, [_accounts, isPrivacyMode])

    const checkUserTeamSubmission = useCallback(async () => {
        console.log("Getting contest when Account :" + _accounts[0])
        const ethereum = (await detectEthereumProvider()) as any
        let members: Event[] = []
        let contract: Contract | null = null
        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
            //need changes in contract code
            // members = await contract.queryFilter(contract.filters.TeamPosted(utils.hexlify(BigInt(_contestId!))))
            return false
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
            members = await contract.queryFilter(
                contract.filters.TeamPosted(utils.hexlify(BigInt(_contestId!)), _accounts[0])
            )
            return (
                members.map((m) => ({
                    contestId: m.args![0],
                    memberUID: m.args![1],
                    teamHash: m.args![2]
                })).length > 0
            )
        }
    }, [_accounts, isPrivacyMode])

    const getContestDetails = useCallback(async () => {
        console.log("Getting contest when Account :" + _accounts[0])
        const ethereum = (await detectEthereumProvider()) as any
        let contests: Event[] = []
        let contract: Contract | null = null

        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
        }
        contests = await contract.queryFilter(contract.filters.ContestCreated(utils.hexlify(BigInt(_contestId!))))
        if (contests.length == 1) {
            return {
                contestGroupId: contests[0].args![0].toString(),
                contestName: parseBytes32String(contests[0].args![1]),
                matchId: contests[0].args![2].toString(),
                contestFee: contests[0].args![3].toString(),
                contestTeamSubmissionEndTime: parseInt(contests[0].args![4].toString()),
                contestEndTime: parseInt(contests[0].args![5].toString())
            }
        }
    }, [_accounts, isPrivacyMode])

    useEffect(() => {
        ;(async () => {
            if (fixture && localTeam && visitorTeam) {
                console.log("Got the state values of fixture, and teams")
                let localTeamSquadSorted: SquadInfo[] = localTeam!.squad!
                localTeamSquadSorted.sort((a, b) => (a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0))
                setLocalTeamSquad(localTeamSquadSorted)
                let visitorTeamSquadSorted: SquadInfo[] = visitorTeam!.squad!
                visitorTeamSquadSorted.sort((a, b) => (a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0))
                setVisitorTeamSquad(visitorTeamSquadSorted)
            } else {
                console.log("Have to make new requests.")
            }
            if (_accounts[0]) {
                // const identity = new Identity(_identityString)
                // console.log(identity.generateCommitment().toString())
                // setIdentityCommitment(identity.generateCommitment().toString())
                const contestDetails = await getContestDetails()
                if (contestDetails != undefined) {
                    setContestDetails(contestDetails)
                    const isUserSubmittedTeam = await checkUserTeamSubmission()
                    setUserSubmittedTeam(isUserSubmittedTeam)
                    const participantsWithTeam = await getParticipantWithTeamList()
                    setParticipantsWithTeam(participantsWithTeam)
                    console.log("Participants with team : ", participantsWithTeam)
                    getHighestScore(contestDetails.contestGroupId)
                    getYourTeamScore(contestDetails.contestGroupId)
                    setLatestBlockTimeStamp(await latestBlockTimestamp())

                    const participants = await getParticipantList()
                    console.log(participants)
                    setParticipants(participants)
                    const prizeClaimStatus = await isContestPrizeClaimed()
                    setContestPrizeClaimed(prizeClaimStatus)
                }
            }
        })()
    }, [_accounts, _identityString, isPrivacyMode])

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
        if (isPrivacyMode && _identityString != "") {
            onCreateTeamOpen()
        } else if (!isPrivacyMode) {
            onCreateTeamOpen()
        } else {
            window.alert("In privacy mode : To create team, please login...")
        }
    }

    const handleViewMyTeam = () => {
        onViewTeamOpen()
    }

    const getHighestScore = async (contestId) => {
        console.log("Getting highest score of contest")
        const ethereum = (await detectEthereumProvider()) as any
        let contract: Contract | null = null
        if (isPrivacyMode) {
            contract = getTrueFantasySportContract(ethereum)
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
        }
        const score = await contract.getHighestScore(contestId)
        setHighestScore(score.toNumber() / 100)
        console.log(score / 100)
    }
    const getYourTeamScore = async (contestId) => {
        console.log("Getting your score of contest")
        const ethereum = (await detectEthereumProvider()) as any
        let score: any = null
        let contract: Contract | null = null
        if (isPrivacyMode) {
            if (_identityString != "") {
                const participantIdentity = new Identity(_identityString)
                const initialNullifierHash = await generateNullifierHash(contestId!, participantIdentity.getNullifier())

                contract = getTrueFantasySportContract(ethereum)
                score = await contract.getYourScore(contestId, initialNullifierHash)
                score = score.toNumber()
            } else {
                score = 0
                window.alert("In privacy mode : Please login")
            }
        } else {
            contract = getTrueFantasySportV1Contract(ethereum)
            score = await contract.getYourScore(contestId)
            score = score.toNumber()
        }
        console.log(score / 100)
        setYourScore(score / 100)
    }

    const handleContestJoin = async () => {
        setLoading.on()
        try {
            console.log("handleJoinContest")
            if (isPrivacyMode) {
                if (_identityString != "") {
                    const identity = new Identity(_identityString)
                    setLog(` Waiting for joining contest transaction confirmation...`)
                    const { status } = await fetch(`${process.env.RELAY_URL}/api/add-member`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contestId: utils.hexlify(BigInt(_contestId!)),
                            identityCommitment: identity.generateCommitment().toString()
                        })
                    })
                    if (status === 200) {
                        setLog(`Successfully joined the contest`)
                    } else {
                        setLog(`Some error occurred, please try again!`)
                    }
                } else {
                    setLog(" Privacy mode On: Please login. OR set privacy mode off and Try again.")
                }
            } else {
                if (_contestDetails != undefined) {
                    const ethereum = (await detectEthereumProvider()) as any
                    const _tfsTokenContract = getTFSTokenContract(ethereum)
                    setLog("Waiting for entry fee amount approval from user...")
                    const tokenApprovalTransaction = await _tfsTokenContract!.approve(
                        process.env.TFS_V1_CONTRACT_ADDRESS,
                        _contestDetails!.contestFee
                    )
                    setLog("Waiting for approved amount transaction confirmation...")
                    await tokenApprovalTransaction.wait()
                    setLog("Waiting for join contest transaction approval from user...")
                    const _trueFantasySportsV1Contract = getTrueFantasySportV1Contract(ethereum)
                    const addMemberTransaction = await _trueFantasySportsV1Contract!.addMember(
                        utils.hexlify(BigInt(_contestId!))
                    )
                    setLog("Waiting for join contest transaction confirmation...")
                    await addMemberTransaction.wait()
                    setLog("Successfully joined a Contest. Loading Contents...")

                    _trueFantasySportsV1Contract!.on("MemberAdded", (contestId, memberAddress) => {
                        setParticipants([..._participants, memberAddress.toString().toLowerCase()])
                    })
                } else {
                    setLog("Error Occured : Unable to get contest details")
                }
            }
        } catch (e) {
            console.log(e)
        }
        setLoading.off()
    }

    const handleSubmitTeam = async (myTeam: MyTeam) => {
        setLoading.on()
        try {
            const ethereum = (await detectEthereumProvider()) as any
            const myTeamPoseidenHash = calculateMyTeamHash(savedTeam!)
            const myTeamHash = utils.solidityKeccak256(["uint256"], [myTeamPoseidenHash])

            if (isPrivacyMode) {
                // teamIdentifier is 31 byte string extracted from teamHash
                setLog("Generating identity proof for team submission...")
                const teamIdentifier = myTeamHash.slice(35)

                const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)

                const contract = getTrueFantasySportContract(ethereum)
                const treeDepth = Number(process.env.TREE_DEPTH)
                const members = await contract.queryFilter(
                    contract.filters.MemberAdded(utils.hexlify(BigInt(_contestId!)))
                )
                const group = new Group()
                group.addMembers(members.map((m) => m.args![1].toString()))
                const participantIdentity = new Identity(_identityString)

                const { proof, publicSignals } = await generateProof(
                    participantIdentity,
                    group,
                    BigInt(_contestId!),
                    teamIdentifier
                )
                setLog("Identity Proof generation completed...")
                const solidityProof = packToSolidityProof(proof)
                console.log("Solidity Proof " + solidityProof)
                setLog("Sending team submitting request...")
                setLog("Waiting for team submitting request completion...")
                const { status } = await fetch(`${process.env.RELAY_URL}/api/post-team`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        teamId: bytes32TeamIdentifier,
                        teamHash: myTeamHash,
                        nullifierHash: publicSignals.nullifierHash,
                        contestId: utils.hexlify(BigInt(_contestId!)),
                        solidityProof: solidityProof
                    })
                })
                if (status === 200) {
                    setLog("Successfully submitted the team in the contest...")
                } else {
                    setLog("Some error occurred, please try refreshing...!")
                }
            } else {
                console.log("contract v1")
                const _trueFantasySportsV1Contract = getTrueFantasySportV1Contract(ethereum)
                setLog("Waiting for team submission transaction approval...")
                const postTeamTransaction = await _trueFantasySportsV1Contract!.postTeam(
                    myTeamHash,
                    utils.hexlify(BigInt(_contestId!))
                )
                setLog("Waiting for team submission transaction confirmation...")
                await postTeamTransaction.wait()
                setLog("Loading contents...")
                _trueFantasySportsV1Contract!.on("TeamPosted", (contestId, _memberAddress, _teamHash) => {
                    setParticipantsWithTeam([
                        ..._participantsWithTeam,
                        {
                            contestId: contestId,
                            memberUID: _memberAddress,
                            teamHash: _teamHash
                        }
                    ])
                    setLoading.off()
                })
            }
        } catch (e) {
            console.log(e)
            setLoading.off()
        }
    }
    const handleCalcScoreAndGenProof = async () => {
        setLoading.on()
        try {
            console.log("started")
            setLog("Generating proof for your team score...")
            const myTeam: MyTeam = savedTeam!

            console.log(myTeam)

            const matchIdentifier: bigint = BigInt(myTeam.matchIdentifier)
            const decimal: bigint = BigInt(myTeam.decimal)
            const selectedPlayerIdentifier: bigint = BigInt(myTeam.selectedPlayerIdentifier)
            const secretIdentity: bigint = BigInt(myTeam.secretIdentity)
            const team: any[][] = myTeam.team

            const tfsProof = await scoreAndTeamCalldata(
                _fantasyScorecard,
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

            setLog("Proof for your team's score generated successfully...")

            const ethereum = (await detectEthereumProvider()) as any
            if (isPrivacyMode) {
                const myTeamHash = utils.solidityKeccak256(["uint256"], [savedTeamHash])

                // teamIdentifier is 31 byte string extracted from teamHash
                const teamIdentifier = myTeamHash.slice(35)

                const bytes32TeamIdentifier = formatBytes32String(teamIdentifier)
                setLog("Generating identity proof for score submission...")
                const contract = getTrueFantasySportContract(ethereum)
                const treeDepth = Number(process.env.TREE_DEPTH)
                const members = await contract.queryFilter(
                    contract.filters.MemberAdded(utils.hexlify(BigInt(_contestId!)))
                )
                const group = new Group()
                group.addMembers(members.map((m) => m.args![1].toString()))
                const participantIdentity = new Identity(_identityString)
                const initialNullifierHash = await generateNullifierHash(
                    _contestId!,
                    participantIdentity.getNullifier()
                )

                const userNullifierCount = await contract.getUserNullifierCount(utils.hexlify(initialNullifierHash))
                console.log("userNullifierCount : " + userNullifierCount)

                const externalNullifier =
                    BigInt(
                        solidityKeccak256(
                            ["uint256", "uint32", "uint256"],
                            [_contestId, userNullifierCount, initialNullifierHash]
                        )
                    ) >> BigInt(8)

                const { proof, publicSignals } = await generateProof(
                    participantIdentity,
                    group,
                    externalNullifier,
                    teamIdentifier
                )

                const semaphoreSolidityProof = packToSolidityProof(proof)
                setLog("Identity proof generation for score submission completed...")
                console.log(
                    JSON.stringify({
                        teamId: bytes32TeamIdentifier,
                        teamHash: myTeamHash,
                        initialNullifierHash: utils.hexlify(BigInt(initialNullifierHash)),
                        nullifierHash: publicSignals.nullifierHash,
                        contestId: utils.hexlify(BigInt(_contestId!)),
                        semaphoreSolidityProof: semaphoreSolidityProof,
                        teamAndScoreInputArray: teamAndScoreInputArray,
                        tfsProof: scoreAndTeamProof
                    })
                )
                setLog("Waiting for score submission request completion...")
                const { status } = await fetch(`${process.env.RELAY_URL}/api/submit-score`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        teamId: bytes32TeamIdentifier,
                        teamHash: myTeamHash,
                        initialNullifierHash: utils.hexlify(BigInt(initialNullifierHash)),
                        nullifierHash: publicSignals.nullifierHash,
                        contestId: utils.hexlify(BigInt(_contestId!)),
                        semaphoreSolidityProof: semaphoreSolidityProof,
                        teamAndScoreInputArray: teamAndScoreInputArray,
                        tfsProof: scoreAndTeamProof
                    })
                })
                if (status === 200) {
                    setLog("Successfully submitted the score... Loading Content... ")
                } else {
                    setLog("Some error occurred, please try again!")
                }
            } else {
                console.log("contract v1")
                const _trueFantasySportsV1Contract = getTrueFantasySportV1Contract(ethereum)
                setLog("Waiting for score submission transaction approval from user...")
                const submitScoreProofTransaction = await _trueFantasySportsV1Contract!.submitTeamScore(
                    utils.hexlify(BigInt(_contestId!)),
                    teamAndScoreInputArray[0], //_score,
                    teamAndScoreInputArray[1], //teamPoseidenHash,
                    teamAndScoreInputArray[2], //_playersScorecard[30],
                    scoreAndTeamProof //array[8]
                )
                setLog("Waiting for score submission transaction confirmation...")
                await submitScoreProofTransaction.wait()
                setLog("Score Submitted successfully : " + teamAndScoreInputArray[0].toString())
            }

            // }
        } catch (e) {
            console.log(e)
        }
        setLoading.off()
    }
    const calculateRemainingTimeInMin = (time: number) => {
        return (time - _latestBlockTimestamp) / 60
    }
    const isCurrentUserAParticipant = () => {
        if (isPrivacyMode) {
            const identity = new Identity(_identityString)
            return _participants.includes(identity.generateCommitment().toString())
        } else {
            return _participants.includes(_accounts[0])
        }
    }
    const hasCurrentUserSubmittedTeam = () => {
        if (isPrivacyMode) {
            const identity = new Identity(_identityString)
            return _participants.includes(identity.generateCommitment().toString())
        } else {
            return _participantsWithTeam.filter((p) => p.memberUID == _accounts[0]).length > 0
        }
    }
    const handleWinningClaim = async () => {
        console.log("handle Winning claim.")
        setLoading.on()
        if (_yourScore >= _highestScore) {
            console.log("contract v1")
            const ethereum = (await detectEthereumProvider()) as any
            setLog("Waiting for winning reward claim transaction approval from user...")
            const _trueFantasySportsV1Contract = getTrueFantasySportV1Contract(ethereum)
            const withdrawWinningAmountTransaction = await _trueFantasySportsV1Contract!.withdrawWinningAmount(
                utils.hexlify(BigInt(_contestId!))
            )
            setLog("Waiting for winning reward claim transaction confirmation...")
            withdrawWinningAmountTransaction.wait()
            setLog("Reward Claim transaction completed. ")
            _trueFantasySportsV1Contract!.on("ClaimedPrize", (contestId, _memberAddress, _amount) => {
                setLog(`Amount of ${_amount} TFS Token transferred to ${_memberAddress} for winning ${contestId}`)
            })
        }
        setLoading.off()
    }
    const handleRequestFantasyScorecard = async () => {
        const playersScoreInMatch: number[] = [
            10, 22, 7, 44, 0, 10, 0, 31, 9, 15, 25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 25, 30, 31, 4, 19, 10, 17, 2, 9, 10, 11,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]
        setFantasyScorecard(playersScoreInMatch)
        console.log(playersScoreInMatch.length)
    }
    console.log("HasCurrentUserSubmittedTeam : ", hasCurrentUserSubmittedTeam())
    console.log("isContestPrizeClaimed : ", _isContestPrizeClaimed)
    return (
        <VStack spacing={2}>
            {fixture.status == "Finished" ? (
                <Alert status="info">
                    <AlertIcon />
                    {"Fixture already finished."}
                </Alert>
            ) : (
                <></>
            )}
            <VStack spacing={2}>
                <Heading as="h5" size="lg">
                    {fixture.localteam.name} vs {fixture.visitorteam.name} - {fixture!.round}
                </Heading>
                <Divider orientation="horizontal" />
            </VStack>

            <VStack spacing={2} alignItems="flex-start">
                <Text fontSize="sm">Fixture date : {getSimpleDate(new Date(fixture!.starting_at))}</Text>
            </VStack>
            <HStack w="80%" spacing={1} justifyContent="space-between">
                <VStack>
                    <Image w={10} src={fixture!.localteam!.image_path} />
                    <Text fontSize="md">{fixture.localteam.name}</Text>
                </VStack>
                <Text fontSize="sm">{fixture!.note}</Text>
                <VStack>
                    <Image w={10} src={fixture!.visitorteam!.image_path} />
                    <Text fontSize="md">{fixture.visitorteam.name}</Text>
                </VStack>
            </HStack>

            <VStack w="100%" alignItems="flex-start">
                <Divider orientation="horizontal" />
                <Text fontSize="sm">
                    Toss :{" "}
                    {fixture!.localteam_id == fixture.toss_won_team_id
                        ? fixture.localteam.name
                        : fixture.visitorteam.name}
                </Text>

                <Text fontSize="sm">
                    Venue : {fixture!.venue.name}, {fixture!.venue.city}{" "}
                </Text>
                <Divider orientation="horizontal" />
            </VStack>
            {_contestDetails ? (
                <>
                    <VStack w="100%">
                        <HStack w="100%" alignItems="flex-start" justifyContent="space-around">
                            <VStack alignItems="flex-start">
                                <Text fontSize="sm">
                                    Contest Name : {_contestDetails ? _contestDetails.contestName : ""}
                                </Text>
                                <Text fontSize="sm">
                                    Contest Entry Fee :{" "}
                                    {_contestDetails ? parseInt(_contestDetails.contestFee) / 10 ** 18 : ""}
                                </Text>
                                <Text fontSize="sm">Participants Count: {_participants.length}</Text>
                            </VStack>

                            <VStack alignItems="flex-start">
                                <Text fontSize="sm">
                                    {"Contest End Time : "}
                                    {_contestDetails && calculateRemainingTimeInMin(_contestDetails.contestEndTime) > 0
                                        ? calculateRemainingTimeInMin(_contestDetails.contestEndTime).toFixed(2)
                                        : 0}{" "}
                                    mins
                                </Text>
                                <Text fontSize="sm">
                                    {"Team Submission Ends Time : "}
                                    {_contestDetails &&
                                    calculateRemainingTimeInMin(_contestDetails.contestTeamSubmissionEndTime) > 0
                                        ? calculateRemainingTimeInMin(
                                              _contestDetails.contestTeamSubmissionEndTime
                                          ).toFixed(2)
                                        : 0}{" "}
                                    mins
                                </Text>
                            </VStack>
                            <VStack alignItems="flex-start">
                                <Text fontSize="sm">Highest Score : {_highestScore}</Text>
                                <Text fontSize="sm">Your Score : {_yourScore}</Text>
                            </VStack>
                        </HStack>
                    </VStack>
                    {fixture.status != "Finished" &&
                    calculateRemainingTimeInMin(_contestDetails.contestTeamSubmissionEndTime) > 0 ? (
                        <HStack>
                            <Button
                                colorScheme="green"
                                isDisabled={_loading || isCurrentUserAParticipant()}
                                onClick={handleContestJoin}
                            >
                                {_participants.includes(_identityCommitment) || _participants.includes(_accounts[0])
                                    ? "Already Joined"
                                    : "Join Contest"}
                            </Button>
                            <Button
                                colorScheme="green"
                                isDisabled={
                                    !isCurrentUserAParticipant ||
                                    _loading ||
                                    !_isUserSubmittedTeam ||
                                    calculateRemainingTimeInMin(_contestDetails.contestEndTime) < 0 ||
                                    _fantasyScorecard.length != 60 ||
                                    _yourScore > 0
                                }
                                onClick={handleCalcScoreAndGenProof}
                            >
                                Generate Your Score Proof and Submit
                            </Button>
                        </HStack>
                    ) : (
                        <>
                            {!isPrivacyMode ? (
                                <Button
                                    colorScheme="green"
                                    isDisabled={
                                        _loading ||
                                        !isCurrentUserAParticipant() ||
                                        calculateRemainingTimeInMin(_contestDetails.contestEndTime) > 0 ||
                                        _yourScore < _highestScore ||
                                        _fantasyScorecard.length != 60 ||
                                        _isContestPrizeClaimed
                                    }
                                    onClick={handleWinningClaim}
                                >
                                    Claim Winning Amount
                                </Button>
                            ) : (
                                <></>
                            )}
                        </>
                    )}

                    <Tabs w="100%">
                        <TabList justifyContent="space-around">
                            <Tab flexGrow="1">My Team</Tab>
                            <Tab flexGrow="1">Fantasy Scorecard </Tab>
                            <Tab flexGrow="1">Participants</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                {_loading ? (
                                    <>
                                        <HStack justifyContent="center">
                                            <Spinner size="xl" />
                                            <Text>{_log}</Text>
                                        </HStack>
                                    </>
                                ) : (
                                    <>
                                        {savedTeam && _contestDetails ? (
                                            <>
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
                                                            <Tr key={"myTeam_1"}>
                                                                <Td>1</Td>
                                                                <Td
                                                                    _hover={{
                                                                        cursor: "pointer"
                                                                    }}
                                                                    onClick={handleViewMyTeam}
                                                                >
                                                                    {savedTeamHash?.substring(0, 15)}...
                                                                </Td>

                                                                <Td>
                                                                    <HStack>
                                                                        <Tooltip
                                                                            hasArrow
                                                                            label={
                                                                                !isCurrentUserAParticipant()
                                                                                    ? "First Join Contest"
                                                                                    : ""
                                                                            }
                                                                            shouldWrapChildren
                                                                            mt="3"
                                                                        >
                                                                            <Button
                                                                                colorScheme="green"
                                                                                isDisabled={
                                                                                    !isCurrentUserAParticipant ||
                                                                                    _loading ||
                                                                                    _isUserSubmittedTeam ||
                                                                                    calculateRemainingTimeInMin(
                                                                                        _contestDetails.contestTeamSubmissionEndTime
                                                                                    ) < 0 ||
                                                                                    hasCurrentUserSubmittedTeam()
                                                                                }
                                                                                onClick={() =>
                                                                                    handleSubmitTeam(savedTeam)
                                                                                }
                                                                            >
                                                                                Submit Team
                                                                            </Button>
                                                                        </Tooltip>
                                                                        <>
                                                                            {/**
                                                                 For Production :
                                                                Have to add one more condition to check whether team submission time have passed. */}
                                                                        </>
                                                                    </HStack>
                                                                </Td>
                                                            </Tr>
                                                        </Tbody>
                                                    </Table>
                                                </TableContainer>
                                                <ViewMyTeam
                                                    fixture={fixture}
                                                    localTeamSquad={_localTeamSquad}
                                                    visitorTeamSquad={_visitorTeamSquad}
                                                    contestId={_contestId!}
                                                    isOpen={isViewTeamOpen}
                                                    onClose={onViewTeamClose}
                                                    myTeam={savedTeam!}
                                                />
                                            </>
                                        ) : (
                                            <HStack justifyContent="space-between">
                                                <p>No team submitted for this contest </p>
                                                {fixture.status != "Finished" &&
                                                calculateRemainingTimeInMin(
                                                    _contestDetails.contestTeamSubmissionEndTime
                                                ) > 0 &&
                                                !hasCurrentUserSubmittedTeam() ? (
                                                    <Button onClick={handleCreateTeam} colorScheme="green">
                                                        Create Team
                                                    </Button>
                                                ) : (
                                                    <></>
                                                )}
                                            </HStack>
                                        )}
                                        <CreateTeam
                                            fixture={fixture}
                                            localTeamSquad={_localTeamSquad}
                                            visitorTeamSquad={_visitorTeamSquad}
                                            contestId={_contestId!}
                                            isOpen={isCreateTeamOpen}
                                            onClose={onCreateTeamClose}
                                        />{" "}
                                    </>
                                )}
                            </TabPanel>

                            <TabPanel>
                                <>
                                    {_fantasyScorecard.length == 60 ? (
                                        <FantasyScorecard
                                            fixture={fixture}
                                            localTeamSquad={_localTeamSquad}
                                            visitorTeamSquad={_visitorTeamSquad}
                                            contestId={_contestId!}
                                            fantasyScorecard={_fantasyScorecard}
                                        />
                                    ) : (
                                        <HStack justifyContent="end">
                                            <Button
                                                isDisabled={_loading}
                                                onClick={handleRequestFantasyScorecard}
                                                colorScheme="green"
                                            >
                                                Request Fantasy ScoreCard
                                            </Button>
                                        </HStack>
                                    )}
                                </>
                            </TabPanel>
                            <TabPanel>
                                <TableContainer>
                                    <Table size="md" variant="striped" colorScheme="teal">
                                        <Thead>
                                            <Tr>
                                                <Th>#</Th>
                                                <Th>Participant UID</Th>

                                                <Th>Participant Team Hash</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {_participantsWithTeam.map((participant, index) => (
                                                <Tr key={"participant_" + index}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <Text>
                                                            {participant.memberUID.toString().substring(0, 15) + "..."}
                                                        </Text>
                                                    </Td>
                                                    <Td>{participant.teamHash.toString().substring(0, 9) + "..."}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </>
            ) : (
                <>
                    <HStack justifyContent="center">
                        <Spinner size="xl" />
                    </HStack>
                </>
            )}
        </VStack>
    )
}

export default Contest
