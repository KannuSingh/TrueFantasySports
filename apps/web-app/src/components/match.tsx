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
    Image,
    Divider,
    Alert,
    AlertIcon
} from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import Contests from "./contests"
import { getSimpleDate } from "../utils/commonUtils"
import { Fixture, SeasonTeam, SquadInfo } from "../models/model"

function Match() {
    let params = useParams()

    let fixtureId = parseInt(params.fixtureId!, 10)!
    const [_fixtureId, setFixtureId] = useState(fixtureId)
    const [_localTeamId, setLocalTeamId] = useState<number>()
    const [_visitorTeamId, setVisitorTeamId] = useState<number>()
    const [_seasonId, setSeasonId] = useState<number>()
    const [_fixture, setFixture] = useState<Fixture>()
    const [_localTeamSquad, setLocalTeamSquad] = useState<SquadInfo[]>([])
    const [_visitorTeamSquad, setVisitorTeamSquad] = useState<SquadInfo[]>([])
    const [_localTeamDetails, setLocalTeamDetails] = useState<SeasonTeam>()
    const [_visitorTeamDetails, setVisitorTeamDetails] = useState<SeasonTeam>()
    const navigate = useNavigate()
    console.log(`Fixtures : ${fixtureId} , Local team : ${_localTeamDetails} , Visitor team : ${_visitorTeamDetails}`)

    useEffect(() => {
        ;(async () => {
            const fixture: Fixture | null | undefined = await getFixtureById()
            if (fixture != null && fixture != undefined) {
                console.log(fixture)
                setFixture(fixture!)
                const localTeamId = fixture.localteam_id
                const visitorTeamId = fixture.visitorteam_id
                const seasonId = fixture.season_id
                setLocalTeamId(localTeamId)
                setVisitorTeamId(visitorTeamId)
                setSeasonId(seasonId)
                const localTeamSquad: SeasonTeam | null | undefined = await getSquadByTeamIdAndSeasonId(
                    localTeamId,
                    seasonId
                )
                const visitorTeamSquad: SeasonTeam | null | undefined = await getSquadByTeamIdAndSeasonId(
                    visitorTeamId,
                    seasonId
                )

                let localTeamSquadSorted: SquadInfo[] = localTeamSquad!.squad!
                localTeamSquadSorted.sort((a, b) => (a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0))
                setLocalTeamSquad(localTeamSquadSorted)
                setLocalTeamDetails(localTeamSquad!)
                let visitorTeamSquadSorted: SquadInfo[] = visitorTeamSquad!.squad!
                visitorTeamSquadSorted.sort((a, b) => (a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0))
                setVisitorTeamSquad(visitorTeamSquadSorted)
                setVisitorTeamDetails(visitorTeamSquad!)
            }
        })()
    }, [])

    const getFixtureById = useCallback(async () => {
        try {
            console.log(`${process.env.RELAY_URL}/api/cricket/fixtures/${_fixtureId}`)
            const response = await fetch(`${process.env.RELAY_URL}/api/cricket/fixtures/${_fixtureId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            if (response.status === 200) {
                const responseJson = await response.json()
                console.log(responseJson.data)
                const fixtureResponse: Fixture = responseJson.data
                return fixtureResponse
            } else {
                console.log("Some error occurred, while getting the fixtures!")
                return null
            }
        } catch (e) {
            console.log(e)
        }
    }, [_fixtureId])

    const getSquadByTeamIdAndSeasonId = useCallback(async (teamId, seasonId) => {
        try {
            const response = await fetch(`${process.env.RELAY_URL}/api/cricket/teams/${teamId}/squad/${seasonId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            if (response.status === 200) {
                const responseJson = await response.json()
                console.log(responseJson.data)
                const seasonTeam: SeasonTeam = responseJson.data
                return seasonTeam
            } else {
                console.log("Some error occurred, while getting the fixtures!")
                return null
            }
        } catch (e) {
            console.log(e)
        }
    }, [])
    const handleContestClick = (contestId: string) => {
        console.log("handleContestClick")

        navigate(`/cricket/fixtures/${fixtureId}/contests/${contestId}`, {
            state: {
                fixture: _fixture!,
                localTeam: _localTeamDetails!,
                visitorTeam: _visitorTeamDetails!
            }
        })
    }
    return (
        <VStack w="100%" spacing={5}>
            {_fixture != null ? (
                <>
                    {_fixture.status == "Finished" ? (
                        <Alert status="info">
                            <AlertIcon />
                            {"Fixture already finished."}
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <VStack spacing={2}>
                        <Heading as="h5" size="lg">
                            {_fixture.localteam.name} vs {_fixture.visitorteam.name} - {_fixture!.round}
                        </Heading>
                        <Divider orientation="horizontal" />
                    </VStack>

                    <VStack spacing={2} alignItems="flex-start">
                        <Text fontSize="sm">Fixture date : {getSimpleDate(new Date(_fixture!.starting_at))}</Text>
                    </VStack>
                    <HStack w="80%" spacing={1} justifyContent="space-between">
                        <VStack>
                            <Image w={10} src={_fixture!.localteam!.image_path} />
                            <Text fontSize="md">{_fixture.localteam.name}</Text>
                        </VStack>
                        <Text fontSize="sm">{_fixture!.note}</Text>
                        <VStack>
                            <Image w={10} src={_fixture!.visitorteam!.image_path} />
                            <Text fontSize="md">{_fixture.visitorteam.name}</Text>
                        </VStack>
                    </HStack>

                    <VStack w="100%" alignItems="flex-start">
                        <Divider orientation="horizontal" />
                        <Text fontSize="sm">
                            Toss :{" "}
                            {_fixture!.localteam_id == _fixture.toss_won_team_id
                                ? _fixture.localteam.name
                                : _fixture.visitorteam.name}
                        </Text>

                        <Text fontSize="sm">
                            Venue : {_fixture!.venue ?_fixture!.venue!.name+', '+ _fixture!.venue.city:''}{" "}
                        </Text>

                        <Divider orientation="horizontal" />
                    </VStack>
                    <Tabs w="100%">
                        <TabList justifyContent="space-around">
                            <Tab flexGrow="1">Contests</Tab>
                            <Tab flexGrow="1">Squad</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <Contests
                                    matchId={_fixtureId!}
                                    createContestEnabled={_fixture.status != "Finished"}
                                    handleContestClick={handleContestClick}
                                />
                            </TabPanel>
                            <TabPanel>
                                <SimpleGrid columns={2} spacing={4}>
                                    <Box>
                                        <Text bg="blue" textAlign="center">
                                            {_fixture.localteam.name}({_localTeamSquad.length})
                                        </Text>
                                        <List spacing={2}>
                                            {_localTeamSquad.map((player) => (
                                                <ListItem key={"squad_host_" + player.id}>{player.fullname}</ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                    <Box>
                                        <Text bg="green" textAlign="center">
                                            {_fixture.visitorteam.name}({_visitorTeamSquad.length})
                                        </Text>
                                        <List spacing={2}>
                                            {_visitorTeamSquad.map((player, index) => (
                                                <ListItem key={"squad_opponent_" + player.id}>
                                                    {player.fullname}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                </SimpleGrid>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </>
            ) : (
                <></>
            )}
        </VStack>
    )
}

export default Match
