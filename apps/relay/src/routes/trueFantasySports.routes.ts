import express from "express"
import trueFantasySportsContractController = require("../controllers/trueFantasySportsContract.controllers")
import trueFantasySportsArtifactsController = require("../controllers/trueFantasySportsArtifacts.controllers")

/**
 * Router Definition
 */
export const tfsContractRouter = express.Router()

tfsContractRouter.get("/application-name", trueFantasySportsContractController.applicationName)
tfsContractRouter.get("/download/:file(*)", trueFantasySportsArtifactsController.downloadSnarkArtifacts)
tfsContractRouter.post("/create-contest", trueFantasySportsContractController.createContest)
tfsContractRouter.post("/add-member", trueFantasySportsContractController.addMember)
tfsContractRouter.post("/post-team", trueFantasySportsContractController.postTeam)
tfsContractRouter.post("/update-team", trueFantasySportsContractController.updateTeam)
tfsContractRouter.post("/submit-score", trueFantasySportsContractController.submitScore)
