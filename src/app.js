import express, { json } from "express"
import "dotenv/config"

import { createMovieRouter } from "./routes/movies.js"

export const createApp = ({ movieModel }) => {
  const app = express()
  app.use(json())
  app.disable("x-powered-by")

  app.use("/movies", createMovieRouter({ movieModel }))

  const PORT = process.env.PORT ?? 3000
  const URL = process.env.NODE_ENV === "production"
    ? "https://nodejs-api-fss8-dev.fl0.io"
    : `http://localhost:${PORT}`

  app.listen(PORT, () => {
    console.log(`server listening on ${URL}`)
  })
}
