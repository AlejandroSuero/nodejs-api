import express, { json } from "express"

import { moviesRouter } from "./routes/movies.js"

const app = express()
app.use(json())
app.disable("x-powered-by")

app.use("/movies", moviesRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`)
})
