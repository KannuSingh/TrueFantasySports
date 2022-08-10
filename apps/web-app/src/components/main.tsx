import React from "react"
import { Box, Link, Button } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

function Main() {
    return (
        <Box p={5}>
            <Link as={RouterLink} to="/identity">
                <Button variant="outline">Create Identity</Button>
            </Link>
            <Link as={RouterLink} to="/matches">
                <Button variant="outline">View Matches</Button>
            </Link>
        </Box>
    )
}

export default Main
