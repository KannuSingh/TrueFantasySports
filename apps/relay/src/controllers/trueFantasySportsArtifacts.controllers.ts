import express from "express"
const path = require("path")

//route to download a file
const downloadSnarkArtifacts = (_req: express.Request, _res: express.Response) => {
    var file = _req.params.file
    var fileLocation = path.join("../../uploads", file)
    console.log(fileLocation)
    _res.download(fileLocation, file)
}

export = {
    downloadSnarkArtifacts
}
