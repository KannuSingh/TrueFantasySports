import React from "react"
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
    ListItem
} from "@chakra-ui/react"
import { useParams } from "react-router-dom"
import { getMatch } from "../data/matches"
import { getSquad } from "../data/squad"
import { getFantasyScorecard } from "../data/fantasyScorecard"
import Contests from "./contests"

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

function Match() {
    let params = useParams()
    let match: Match = getMatch(parseInt(params.matchId!, 10))!
    let squad: Squad = getSquad(parseInt(params.matchId!, 10))!
    let fantasyScorecard: FantasyScoreCard = getFantasyScorecard(parseInt(params.matchId!, 10))!
    console.log(match)
    return (
        <Flex align="center" justify="center">
            <VStack w="60%" spacing={3}>
                <Heading as="h3" size="lg">
                    {match.title}
                </Heading>
                <VStack w="100%" spacing={2} alignItems="flex-start">
                    <Text>Host : {match.host}</Text>
                    <Text>Opponent : {match.opponent}</Text>
                    <Text>Date : {match.matchDate}</Text>
                </VStack>

                <Tabs w="100%">
                    <TabList justifyContent="space-around">
                        <Tab flexGrow="1">Squad</Tab>
                        <Tab flexGrow="1">Fantasy Scorecard</Tab>
                        <Tab flexGrow="1">Contests</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <SimpleGrid columns={2} spacing={4}>
                                <Box>
                                    <Text bg="blue" textAlign="center">
                                        {match.host}
                                    </Text>
                                    <List spacing={2}>
                                        {squad.host.map((playerName, index) => (
                                            <ListItem key={"squad_host_" + playerName + index}>{playerName}</ListItem>
                                        ))}
                                    </List>
                                </Box>
                                <Box>
                                    <Text bg="green" textAlign="center">
                                        {match.opponent}
                                    </Text>
                                    <List spacing={2}>
                                        {squad.opponent.map((playerName, index) => (
                                            <ListItem key={"squad_opponent_" + playerName + index}>
                                                {playerName}
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </SimpleGrid>
                        </TabPanel>
                        <TabPanel>
                            <SimpleGrid columns={2} spacing={4}>
                                <Box>
                                    <Text bg="blue" textAlign="center">
                                        {match.host}
                                    </Text>
                                    <List spacing={2}>
                                        {fantasyScorecard.host.map((scorecard, index) => (
                                            <ListItem key={"fsc_host_player_" + scorecard.name + index}>
                                                <HStack justify="space-around">
                                                    <Text w="100%" textAlign="start">
                                                        {scorecard.name}
                                                    </Text>
                                                    <Text>{scorecard.fantasyScore}</Text>
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                                <Box>
                                    <Text bg="green" textAlign="center">
                                        {match.opponent}
                                    </Text>
                                    <List spacing={2}>
                                        {fantasyScorecard.opponent.map((scorecard, index) => (
                                            <ListItem key={"fsc_opponent_player" + scorecard.name + index}>
                                                <HStack justify="space-around">
                                                    <Text w="100%" textAlign="start">
                                                        {scorecard.name}
                                                    </Text>
                                                    <Text>{scorecard.fantasyScore}</Text>
                                                </HStack>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </SimpleGrid>
                        </TabPanel>
                        <TabPanel>
                            <Contests matchId={params.matchId} />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </VStack>
        </Flex>
    )
}

export default Match
