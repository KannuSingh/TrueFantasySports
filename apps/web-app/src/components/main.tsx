import React, { useState } from "react"
import {
    Box,
    Link,
    Button,
    Select,
    FormLabel,
    FormControl,
    Flex,
    VStack,
    FormHelperText,
    FormErrorMessage
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"

function Main() {
    const [_sportId, setSportId] = useState("")
    const [_formSubmitted, setFormSubmitted] = useState(false)
    const navigate = useNavigate()
    const handleSelectSports = () => {
        setFormSubmitted(true)
        console.log("Selected sport Id : " + _sportId)
        if (_sportId == "1") {
            navigate(`/cricket`)
        }
    }
    const isError = _sportId === ""
    return (
        <Flex align="center" justify="center">
            {/** <Link as={RouterLink} to="/identity">
                <Button variant="outline">Create Identity</Button>
    </Link> */}
            <VStack w="40%" spacing={3} p={4}>
                <FormControl isInvalid={isError && _formSubmitted}>
                    <FormLabel>Sports</FormLabel>
                    <Select
                        value={_sportId}
                        onChange={(e) => {
                            setSportId(e.target.value)
                        }}
                        placeholder="Select Sport"
                    >
                        <option value="1">Cricket</option>
                    </Select>
                    {!isError ? (
                        <FormHelperText>Select a sport</FormHelperText>
                    ) : (
                        <FormErrorMessage>Select a sport to continue.</FormErrorMessage>
                    )}
                </FormControl>
                <Button variant="outline" onClick={handleSelectSports}>
                    {" "}
                    Submit
                </Button>
            </VStack>
        </Flex>
    )
}

export default Main
