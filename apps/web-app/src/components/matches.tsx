import React from "react"
import { Box, Text, Link, VStack, Heading } from "@chakra-ui/react"
import { Link as RouterLink, Outlet } from "react-router-dom"
import { getMatches } from "../data/matches"

function Matches() {
    let matches = getMatches()
    return (
        <Box p={5}>
            <Heading as="h4" size="lg">
                Matches
            </Heading>
            <VStack spacing={8}>
                {matches.map((match, index) => (
                    <Link as={RouterLink} to={`/matches/${match.id}`} key={match.id}>
                        <Text>
                            {index + 1}. {match.title}
                        </Text>
                    </Link>
                ))}
            </VStack>
            <Outlet />
        </Box>
    )
}

export default Matches
