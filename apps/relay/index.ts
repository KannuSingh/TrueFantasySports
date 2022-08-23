import cors from "cors"
import express from "express"
import { cricketRouter } from "./src/routes/cricket.routes"
import { tfsContractRouter } from "./src/routes/trueFantasySports.routes"

const { port } = new URL(process.env.RELAY_URL!)

const app = express()

/**
 *  App Configuration
 */
app.use(cors())
app.use(express.json())
app.use("/api", tfsContractRouter)
app.use("/api/cricket", cricketRouter)

/**
 * Server Activation
 */
app.listen(port, () => {
    console.info(`Started HTTP relay API at ${process.env.RELAY_URL}/`)
})
