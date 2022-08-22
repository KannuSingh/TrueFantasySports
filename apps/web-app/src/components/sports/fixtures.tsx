import React, { useCallback, useEffect, useState } from "react"
import {
    Box,
    Text,
    VStack,
    Heading,
    Flex,
    HStack,
    Thead,
    Table,
    Tr,
    Th,
    Tbody,
    Td,
    Button,
    Divider,
    TableContainer
} from "@chakra-ui/react"
import {
    getNextWeekEndDate,
    getNextWeekStartDate,
    getPreviousWeekEndDate,
    getPreviousWeekStartDate,
    getSimpleDate,
    getWeekEndDate,
    getWeekStartDate
} from "../../utils/commonUtils"
import { useNavigate } from "react-router-dom"
import { Fixture } from "../../Model/model"
import { useParams } from "react-router-dom"

function Fixtures() {
    let params = useParams()
    const [_fixtures, setFixtures] = useState<Fixture[]>([])
    const [_startDate, setStartDate] = useState<Date>()
    const [_endDate, setEndDate] = useState<Date>()
    const [_leagueId, setLeagueId] = useState<number>(parseInt(params.leagueId!, 10))
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            setStartDate(getWeekStartDate())
            setEndDate(getWeekEndDate())
        })()
    }, [])

    useEffect(() => {
        ;(async () => {
            if (_leagueId && _startDate! && _endDate!) {
                console.log("Calling")
                const startDate: string = getSimpleDate(_startDate!)
                const endDate: string = getSimpleDate(_endDate!)
                const fixtures: Fixture[] | undefined = await getAllFixtureForLeague(_leagueId, startDate, endDate)
                setFixtures(fixtures!)
            }
        })()
    }, [_startDate, _endDate])

    const getAllFixtureForLeague = useCallback(
        async (leagueId: number, startDate: string, endDate: string) => {
            try {
                const response = await fetch(`${process.env.RELAY_URL}/api/cricket/fixtures`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        LEAGUE_ID: leagueId,

                        START_DATE: startDate,
                        END_DATE: endDate
                    })
                })
                if (response.status === 200) {
                    const responseJson = await response.json()
                    const fixturesResponse: Fixture[] = responseJson.data
                    return fixturesResponse
                } else {
                    console.log("Some error occurred, while getting the fixtures!")
                    return []
                }
            } catch (e) {
                console.log(e)
            }
        },
        [_startDate, _endDate]
    )

    const handleCurrentWeek = () => {
        setStartDate(getWeekStartDate())
        setEndDate(getWeekEndDate())
    }

    const handlePreviousWeek = () => {
        const previousWeekStartDate = getPreviousWeekStartDate(_startDate!)
        const previousWeekEndDate = getPreviousWeekEndDate(_startDate!)
        setStartDate(previousWeekStartDate)
        setEndDate(previousWeekEndDate)
    }

    const handleNextWeek = () => {
        const nextWeekStartDate = getNextWeekStartDate(_startDate!)
        const nextWeekEndDate = getNextWeekEndDate(_startDate!)
        setStartDate(nextWeekStartDate)
        setEndDate(nextWeekEndDate)
    }

    const handleFixtureSelection = (
        fixtureId: number,
        seasonId: number,
        localTeamId: number,
        visitorTeamId: number
    ) => {
        console.log(
            `Selected Fixture : ${fixtureId} ,Season : ${seasonId} , Local Team : ${localTeamId} , Visitor Team ID : ${visitorTeamId}`
        )

        navigate(`/cricket/fixtures/${fixtureId}`)
    }

    return (
        <VStack spacing={5}>
            {/* <Box w="90%">
           <Heading as="h5" size="lg">
              Seasons
          </Heading>

          _seasons && _seasons.length > 0 ? (
              <Flex wrap="wrap" gap="3">
                  {_seasons.map((season) => (
                      <Tag
                          size="lg"
                          key={season.id}
                          _hover={{
                              cursor: "pointer",
                              fontWeight: "bold"
                          }}
                          onClick={() => handleSeasonClick(season.id, season.league_id)}
                          variant="solid"
                          colorScheme="teal"
                      >
                          {season.name}
                      </Tag>
                  ))}
              </Flex>
          ) : (
              <></>
          ) 
      </Box>*/}
            <Box w="90%">
                {_startDate && _endDate && _leagueId ? (
                    <VStack>
                        <VStack spacing={3}>
                            <Heading as="h5" size="lg">
                                Fixtures
                            </Heading>
                            <Divider orientation="horizontal" />
                        </VStack>

                        <Text fontSize="xs">{`${getSimpleDate(_startDate!)} to ${getSimpleDate(_endDate!)}`}</Text>
                        <Flex w="100%" justifyContent="space-between">
                            <Button onClick={handleCurrentWeek}>Current Week</Button>

                            <HStack>
                                <Button onClick={handlePreviousWeek}>Previous Week</Button>
                                <Button onClick={handleNextWeek}>Next Week</Button>
                            </HStack>
                        </Flex>
                        <TableContainer w="100%">
                            <Table size="sm" variant="striped" colorScheme="blue">
                                <Thead>
                                    <Tr>
                                        <Th>#</Th>
                                        <Th>Home</Th>

                                        <Th>Visitor</Th>
                                        <Th>Date</Th>
                                    </Tr>
                                </Thead>
                                {_fixtures && _fixtures.length > 0 ? (
                                    <Tbody>
                                        {_fixtures.map((fixture, index) => (
                                            <Tr
                                                key={index}
                                                _hover={{
                                                    cursor: "pointer",
                                                    fontWeight: "semibold"
                                                }}
                                                onClick={() =>
                                                    handleFixtureSelection(
                                                        fixture.id,
                                                        fixture.season_id,
                                                        fixture.localteam_id,
                                                        fixture.visitorteam_id
                                                    )
                                                }
                                            >
                                                <Td>
                                                    <Text>{index + 1}</Text>
                                                </Td>
                                                <Td>{fixture!.localteam!.name}</Td>
                                                <Td>{fixture!.visitorteam!.name}</Td>
                                                <Td>{getSimpleDate(new Date(fixture!.starting_at!))}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                ) : (
                                    <></>
                                )}
                            </Table>
                        </TableContainer>
                    </VStack>
                ) : (
                    <>
                        <Text> Select a league to view fixtures</Text>
                    </>
                )}
            </Box>
        </VStack>
    )
}

export default Fixtures
