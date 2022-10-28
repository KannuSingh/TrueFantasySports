import React, { useCallback, useEffect, useState } from "react"
import {
    Box,
    Text,
    VStack,
    Flex,
    HStack,
    Button,
    Image,
    List,
    ListItem,
    Stack,
    useColorModeValue,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
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
import { Fixture, League } from "../../models/model"
import { useParams } from "react-router-dom"
import { FaChevronDown } from "react-icons/fa"


interface FixturesProps{
    leagues: League[];
    onFixtureSelection(fixtureId:number) : void
}

function Fixtures({leagues, onFixtureSelection}:FixturesProps) {
    let params = useParams()
    const [_fixtures, setFixtures] = useState<Fixture[]>([])
    const [_startDate, setStartDate] = useState<Date>()
    const [_endDate, setEndDate] = useState<Date>()
    const [_leagueName, setLeagueName] = useState('All')
    const [_leagueId, setLeagueId] = useState(-1)//parseInt(params.leagueId!, 10)
    const navigate = useNavigate()

    useEffect(() => {
        ;(async () => {
            setStartDate(getWeekStartDate())
            setEndDate(getWeekEndDate())
            
        })()
    }, [])

    useEffect(() => {
        ;(async () => {
            if (_leagueId!=-1 && _startDate! && _endDate!) {
                console.log("Calling")
                
                
            }else{
                const fixtures: Fixture[] | undefined = await getAllFixtures()
                console.log(JSON.stringify(fixtures))
                setFixtures(fixtures!)
            }
        })()
    }, [_startDate, _endDate,_leagueId])

    const getAllFixtures =  useCallback(async () => {
            try {
                const response = await fetch(`${process.env.RELAY_URL}/api/cricket/allfixtures`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })
                if (response.status === 200) {
                    const responseJson = await response.json()
                    const fixturesResponse: Fixture[] = responseJson.data
                    return fixturesResponse
                } else {
                    console.log("Some error occurred, while getting all fixtures!")
                    return []
                }
            } catch (e) {
                console.log(e)
            }
        },
        [_startDate, _endDate,_leagueId]
    )
        
    
    

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
        [_startDate, _endDate,_leagueId]
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
    const handleLeagueSelection = async(leagueId,leagueName) =>{
        setLeagueId(leagueId)
        setLeagueName(leagueName)
        const startDate: string = getSimpleDate(_startDate!)
        const endDate: string = getSimpleDate(_endDate!)
        const fixtures: Fixture[] | undefined = await getAllFixtureForLeague(_leagueId, startDate, endDate)
        setFixtures(fixtures!)
    }
   

    return (
        
            
            <Box w="full">
                {_startDate && _endDate && _leagueId ? (
                    <VStack>
                        <HStack w="full" justify='space-between'>
                            <Text>Upcoming Matches</Text>
                            <HStack>
                                <Text>Filters :</Text>
                                
                                {leagues && leagues.length > 0 ? (
                                <>
                                    <Menu >
                                        <MenuButton as={Button} size='sm' variant='outline' rightIcon={<FaChevronDown />}>{_leagueName}</MenuButton>
                                            <MenuList>
                                                <MenuItem key='-1' onClick={()=> {
                                                    setLeagueId(-1)
                                                    setLeagueName('All')
                                                    }}>All Leagues
                                                </MenuItem>

                                            {leagues.map((league, index) => 
                                                <MenuItem key={league.id} onClick={() => {
                                                        handleLeagueSelection(league.id,league.name)
                                                    }} icon={<ImageIcon url={league.image_path}/>}>
                                                    {league.name} 
                                                </MenuItem>
                                            )}
                                            </MenuList>
                                    </Menu>
                                </> 
                                )
                                : <></>
                                }
                                
                            </HStack>
                            <Button>View All</Button>
                        </HStack>
                        
                        
                        <Text fontSize="xs">{`${getSimpleDate(_startDate!)} to ${getSimpleDate(_endDate!)}`}</Text>
                        
                        
                        <Flex w="100%" justifyContent="space-between">
                            <Button onClick={handleCurrentWeek}>Current Week</Button>

                            <HStack>
                                <Button onClick={handlePreviousWeek}>Previous Week</Button>
                                <Button onClick={handleNextWeek}>Next Week</Button>
                            </HStack>
                        </Flex>
                       
                        {_fixtures && _fixtures.length > 0 ? (
                            <List w='full' spacing='3'>
                                 {_fixtures.map((fixture, index) => (
                                    <ListItem
                                        h='20'
                                        bg={useColorModeValue('white', 'gray.900')} 
                                        key={fixture.id.toString()}
                                        border='1px'
                                        _hover={{
                                            cursor: "pointer",
                                            fontWeight: "semibold"
                                        }}
                                        onClick={() =>
                                            onFixtureSelection(
                                                fixture.id
                                            )
                                        }
                                        >
                                        <HStack px='3' h='full' alignContent='center' justify='space-between'>
                                            <Stack
                                                w='20%'
                                                direction='column'
                                                align='center'
                                                justify='center'
                                            >
                                                <Image w={6} h={6} rounded="full" src={fixture.localteam.image_path} />
                                                <Text> {fixture!.localteam!.name} </Text>
                                            </Stack>

                                            <Stack  
                                                direction='column'
                                                spacing='0'>
                                                    
                                                <Text 
                                                    align='center'
                                                    fontSize='2xs'>
                                                        {getSimpleDate(new Date(fixture!.starting_at!))}
                                                </Text>
                                                <Text fontSize='2xs'>{fixture!.venue ?fixture!.venue!.name:''}</Text>
                                            </Stack>

                                            <Stack
                                                w='20%'
                                                direction={{base:'column',md:'column'}}
                                                align='center'
                                                justify='center'
                                            >
                                                <Image w={6} rounded="full" src={fixture.visitorteam.image_path} />
                                                <Text>{fixture!.visitorteam!.name} </Text>
                                            </Stack>
                                           
                                        </HStack>
                                    </ListItem>
                                ))}
                            </List>
                        ): (
                            <></>
                        )}
                       

                       
                    </VStack>
                ) : (
                    <>
                        <Text> No matches</Text>
                    </>
                )}
            </Box>
     
    )
}

function ImageIcon(props: { url: string | undefined }) {
    return (
        <>
            <Image w={6} rounded="full" src={props.url} />
        </>
    )
}

export default Fixtures
