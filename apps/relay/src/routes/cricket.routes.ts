import express from "express"
import cricketController = require("../controllers/cricket.controllers")

/**
 * Router Definition
 */
export const cricketRouter = express.Router()

cricketRouter.get("/leagues", cricketController.allLeagues)
cricketRouter.get("/leagues/:leagueID", cricketController.leagueById)
cricketRouter.get("/allfixtures", cricketController.fixtures)
cricketRouter.post("/fixtures", cricketController.fixtureByLeagueId)
cricketRouter.get("/fixtures/:fixtureId", cricketController.fixtureById)
cricketRouter.get("/teams/:teamId/squad/:seasonId", cricketController.getSquadByTeamIdAndSeasonId)
