import React, { useCallback, useEffect, useState } from "react"
import {
    Box,
    Flex,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from "@chakra-ui/react"
import { Link as RouterLink, Outlet, useNavigate, useParams } from "react-router-dom"

import { League } from "../../models/model"
import Fixtures from "./fixtures"

function Cricket() {
    let params = useParams()

    
    const [_leagues, setLeagues] = useState<League[]>([])
    const [_fixtureId, setFixtureId] = useState<number>()
    const [_leagueId, setLeaguesId] = useState<number>()
    const navigate = useNavigate()
   
    useEffect(() => {
        ;(async () => {
            console.log("Params FixtureId : "+params.fixtureId)
            if(params.fixtureId ){
                setFixtureId(parseInt(params.fixtureId!, 10)) 
            }else{
                const allLeagues = await getAllLeagues()
                console.log(allLeagues)
                setLeagues(allLeagues!)
                setFixtureId(undefined)
            }
        })()
    }, [_fixtureId])

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

    const handleFixtureSelection = (
        fixtureId: number,
    ) => {
        setFixtureId(fixtureId)
        navigate(`/cricket/fixtures/${fixtureId}`)
    }


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
    console.log(_fixtureId)
    return (
        <Flex align="start" direction='column'>
            <Breadcrumb fontSize='sm'>
                <BreadcrumbItem>
                    <BreadcrumbLink as={RouterLink} to='/cricket'>
                        Cricket
                    </BreadcrumbLink>
                </BreadcrumbItem>
            </Breadcrumb>

            <Box 
                w="70%" 
                p='2'
                borderWidth={1} 
                borderColor="gray.500" 
                borderRadius="1">

               {params.fixtureId ? <Outlet /> : <Fixtures leagues={_leagues} onFixtureSelection={handleFixtureSelection}/>}
                
                
                
            </Box >
        </Flex>
    )
}


export default Cricket
