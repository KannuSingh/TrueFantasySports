import React, { useCallback, useEffect, useState } from "react"
import {
    Box,
    Text,
    Link,
    VStack,
    Heading,
    Flex,
    Grid,
    GridItem,
    List,
    ListItem,
    ListIcon,
    Image,
    HStack,
    Divider,
    OrderedList,
    UnorderedList,
    Wrap
} from "@chakra-ui/react"
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom"

import { League } from "../../models/model"

function Cricket() {
    const [_leagues, setLeagues] = useState<League[]>([])
    const [_leagueId, setLeaguesId] = useState<number>()
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            const allLeagues = await getAllLeagues()
            console.log(allLeagues)
            setLeagues(allLeagues!)
        })()
    }, [])

    const getAllLeagues = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.RELAY_URL}/api/cricket/leagues`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            if (response.status === 200) {
                const responseJson = await response.json()
                const leagueResponse: League[] = responseJson.data
                return leagueResponse
            } else {
                console.log("Some error occurred, while getting the leagues!")
                return []
            }
        } catch (e) {
            console.log(e)
        }
    }, [_leagues])

    const getAllSeasons = (leagueId: number) => {
        try {
            if (_leagues.length > 0) {
                const leagues = _leagues.filter((league) => league.id == leagueId)
                if (leagues.length == 1) {
                    console.log(leagues[0].seasons)
                    return leagues[0].seasons
                } else {
                    return []
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    const handleLeagueClick = async (leagueId: number) => {
        console.log("League Id: " + leagueId)
        setLeaguesId(leagueId)
        navigate(`/cricket/leagues/${leagueId}/fixtures`)
        /* const seasons: Season[] | undefined = getAllSeasons(leagueId)
        console.log("SEASONS : " + seasons!.reverse())
        setSeasons(seasons!)
        const startDate: string = getSimpleDate(_startDate!)
        const endDate: string = getSimpleDate(_endDate!)
        const fixtures: Fixture[] | undefined = await getAllFixtureForLeague(leagueId, startDate, endDate)
        setFixtures(fixtures!)
        setLeagueId(leagueId)*/
    }

    const handleSeasonClick = async (seasonId: number, leagueId: number) => {
        console.log(`seasonId :${seasonId} and League Id : ${leagueId}`)
        /* const startDate: string = getSimpleDate(_startDate!)
        const endDate: string = getSimpleDate(_endDate!)
        const fixtures = await getAllFixtureForLeague(leagueId, startDate, endDate)*/
    }

    return (
        <Flex align="center" justify="center" m={8}>
            <Box w="100%">
                <VStack spacing={8}>
                    <Grid w="100%" h="80vh" templateRows="repeat(2, 1fr)" templateColumns="repeat(9, 1fr)" gap={4}>
                        <GridItem rowSpan={1} colSpan={2} borderRight="1px" borderColor="gray.200">
                            <VStack spacing={5}>
                                <VStack spacing={3}>
                                    <Heading as="h5" size="lg">
                                        Cricket Leagues
                                    </Heading>
                                    <Divider orientation="horizontal" />
                                </VStack>
                                <List w="90%" spacing={3}>
                                    {_leagues && _leagues.length > 0 ? (
                                        <>
                                            {_leagues.map((league, index) => (
                                                <ListItem
                                                    key={league.id}
                                                    _hover={{
                                                        cursor: "pointer",
                                                        fontWeight: "semibold"
                                                    }}
                                                    onClick={() => handleLeagueClick(league.id)}
                                                >
                                                    <HStack>
                                                        <ListIcon as={ImageIcon} url={league.image_path} />

                                                        <Text> {league.name}</Text>
                                                    </HStack>
                                                </ListItem>
                                            ))}{" "}
                                        </>
                                    ) : (
                                        <></>
                                    )}
                                </List>
                            </VStack>
                        </GridItem>
                        <GridItem rowSpan={2} colSpan={5}>
                            {_leagueId ? <Outlet /> : <Text>Please select a league</Text>}
                        </GridItem>
                        <GridItem rowSpan={2} colSpan={2} borderLeft="1px" borderColor="gray.200">
                            <Box w="90%">
                                <VStack spacing={5}>
                                    <VStack spacing={3}>
                                        <Heading as="h5" size="lg">
                                            How to use the system.
                                        </Heading>
                                        <Divider orientation="horizontal" />
                                    </VStack>
                                    <Wrap w="90%">
                                        <UnorderedList fontSize="xs">
                                            <ListItem>
                                                -System have two modes.
                                                <OrderedList>
                                                    <ListItem>Normal/Public transactions (Default Mode). </ListItem>
                                                    <ListItem>Transaction privacy using relay system.</ListItem>
                                                </OrderedList>
                                            </ListItem>

                                            <ListItem>
                                                {" "}
                                                -Default mode : User pays for all the transactions fee contest entry fee
                                                using True Fantasy Sports TFS Tokens.
                                            </ListItem>
                                            <ListItem> -User start by selecting the sports.</ListItem>
                                            <ListItem>
                                                {" "}
                                                -Then selects the sporting league to view the upcoming fixtures/matches.
                                            </ListItem>
                                            <ListItem> -Then selects the fixture/match user interested in.</ListItem>
                                            <ListItem>
                                                {" "}
                                                -If there is no existing contest for the selected fixture, user can
                                                create there own contest.
                                            </ListItem>
                                            <ListItem>
                                                {" "}
                                                -Then selecting the contest and creating team for that contest.
                                            </ListItem>
                                            <ListItem>
                                                {" "}
                                                -Once fantasy team is created user, submits the hash of team on chain.
                                            </ListItem>
                                            <ListItem>
                                                {" "}
                                                -User selects the fantasy scorecard and request for fantasy scorecard.
                                            </ListItem>
                                            <ListItem>
                                                {" "}
                                                -After fantasy scorecard is received , user can generated proof for
                                                their team lineup and submit.
                                            </ListItem>
                                            <ListItem>
                                                {" "}
                                                -If user has the highscore for this contest and contest completion time
                                                is reached , then user can caim the accumulated contest rewards.
                                            </ListItem>
                                        </UnorderedList>
                                        <Text color="tomato">
                                            * There may some error occurs during trying out, try reloading the webapp.
                                            If problem persist , try clearing the cache and start fresh.
                                        </Text>
                                    </Wrap>
                                </VStack>
                            </Box>
                        </GridItem>
                    </Grid>
                </VStack>
            </Box>
        </Flex>
    )
}

function ImageIcon(props: { url: string | undefined }) {
    return (
        <>
            <Image w={6} rounded="full" src={props.url} />
        </>
    )
}
export default Cricket
