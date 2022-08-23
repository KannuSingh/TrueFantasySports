import { Request, Response } from "express"
import axios from "axios"
import { config as dotenvConfig } from "dotenv"
import { resolve } from "path"

dotenvConfig({ path: resolve(__dirname, "./../../../../../.env") })

const cricketAPI = process.env.CRICKET_API
const authUrl = (url: string) => (url += `api_token=${process.env.SPORTMONK_API_KEY}`)
//route to download a file
const allLeagues = async (_req: Request, _res: Response) => {
    console.log("Request : Get All Leagues ")

    try {
        var requestOptions = {
            method: "GET"
        }

        let response = await axios(authUrl(`${cricketAPI}/leagues?include=seasons&`), requestOptions)

        if (response.status == 200) {
            _res.status(200).json(response.data).end()
        } else {
            _res.status(response.status).end("Some error occured.")
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const leagueById = async (_req: Request, _res: Response) => {
    try {
        var requestOptions = {
            method: "GET"
        }
        const _leagueID = _req.params.leagueID
        console.log("Request : Get Leagues with Id: " + _leagueID)

        let response = await axios(authUrl(`${cricketAPI}/leagues/${_leagueID}?include=seasons&`), requestOptions)

        if (response.status == 200) {
            _res.status(200).json(response.data).end()
        } else {
            _res.status(response.status).end("Some error occured.")
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}
const fixtureByLeagueIdAndSeasonId = async (_req: Request, _res: Response) => {
    try {
        var requestOptions = {
            method: "GET"
        }

        const { LEAGUE_ID, SEASON_ID, START_DATE, END_DATE } = _req.body
        console.log(
            `Request : Get All fixtures for LEAGUE ID : ${LEAGUE_ID} , SEASON ID :${SEASON_ID} between ${START_DATE} and ${END_DATE}  `
        )
        let response = await axios(
            authUrl(
                `${cricketAPI}/fixtures?filter[season_id]=${SEASON_ID}&filter[league_id]=${LEAGUE_ID}&filter[starts_between]=${START_DATE},${END_DATE}&include=venue,localteam,visitorteam&`
            ),
            requestOptions
        )

        if (response.status == 200) {
            _res.status(200).json(response.data).end()
        } else {
            _res.status(response.status).end("Some error occured.")
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}
const fixtureByLeagueId = async (_req: Request, _res: Response) => {
    try {
        var requestOptions = {
            method: "GET"
        }

        const { LEAGUE_ID, START_DATE, END_DATE } = _req.body
        console.log(`Request : Get All fixtures for LEAGUE ID : ${LEAGUE_ID}  between ${START_DATE} and ${END_DATE}  `)
        let response = await axios(
            authUrl(
                `${cricketAPI}/fixtures?filter[league_id]=${LEAGUE_ID}&filter[starts_between]=${START_DATE},${END_DATE}&include=venue,localteam,visitorteam&sort=starting_at&`
            ),
            requestOptions
        )

        if (response.status == 200) {
            _res.status(200).json(response.data).end()
        } else {
            _res.status(response.status).end("Some error occured.")
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

const fixtureById = async (_req: Request, _res: Response) => {
    try {
        var requestOptions = {
            method: "GET"
        }
        const FIXTURE_ID = _req.params.fixtureId
        console.log(_req.query)
        console.log(`Request : Get fixtures for ID : ${FIXTURE_ID}  `)
        if (FIXTURE_ID) {
            let response = await axios(
                authUrl(`${cricketAPI}/fixtures/${FIXTURE_ID}?include=venue,localteam,visitorteam&sort=starting_at&`),
                requestOptions
            )

            if (response.status == 200) {
                _res.status(200).json(response.data).end()
            } else {
                _res.status(response.status).end("Some error occured.")
            }
        } else {
            _res.status(500).end("Internal server error")
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}
const getSquadByTeamIdAndSeasonId = async (_req: Request, _res: Response) => {
    try {
        var requestOptions = {
            method: "GET"
        }
        const TEAM_ID = _req.params.teamId
        const SEASON_ID = _req.params.seasonId
        console.log(`Request : Get Squad for Team ID : ${TEAM_ID} and SEASON : ${SEASON_ID}  `)
        if (TEAM_ID && SEASON_ID) {
            let response = await axios(authUrl(`${cricketAPI}/teams/${TEAM_ID}/squad/${SEASON_ID}?`), requestOptions)

            if (response.status == 200) {
                _res.status(200).json(response.data).end()
            } else {
                _res.status(response.status).end("Some error occured.")
            }
        }
    } catch (error: any) {
        console.error(error)

        _res.status(500).end()
    }
}

export = {
    allLeagues,
    leagueById,
    fixtureByLeagueIdAndSeasonId,
    fixtureByLeagueId,
    fixtureById,
    getSquadByTeamIdAndSeasonId
}
