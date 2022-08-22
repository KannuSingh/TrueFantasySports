import React, { useState } from "react"
import { Box, Text, HStack, SimpleGrid, List, ListItem } from "@chakra-ui/react"
import { Fixture, SquadInfo } from "../Model/model"

function FantasyScorecard(props: {
    fixture: Fixture
    localTeamSquad: SquadInfo[]
    visitorTeamSquad: SquadInfo[]
    contestId: string
    fantasyScorecard: number[]
}) {
    const _localTeamSquadLength = props.localTeamSquad.length

    return (
        <SimpleGrid columns={2} spacing={4}>
            <Box>
                <Text bg="blue" textAlign="center">
                    {props.fixture.localteam.name}({_localTeamSquadLength}
                </Text>
                <List spacing={2}>
                    {props.localTeamSquad.map((player, index) => (
                        <ListItem key={"fsc_host_player_" + player.id}>
                            <HStack justify="space-around">
                                <Text w="100%" textAlign="start">
                                    {player.fullname}
                                </Text>
                                <Text>{props.fantasyScorecard[index]}</Text>
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
                        <ListItem key={"fsc_" + player.id}>
                            <HStack justify="space-around">
                                <Text w="100%" textAlign="start">
                                    {player.fullname}
                                </Text>
                                <Text> {props.fantasyScorecard[_localTeamSquadLength! + index]}</Text>
                            </HStack>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </SimpleGrid>
    )
}

export default FantasyScorecard
