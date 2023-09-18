import express, { json } from "express"

import { createMovieRouter } from "./routes/movies.js"

export const createApp = ({ movieModel }) => {
  const app = express()
  app.use(json())
  app.disable("x-powered-by")

  app.use("/movies", createMovieRouter({ movieModel }))

  const PORT = process.env.PORT ?? 3000

  app.listen(PORT, () => {
    console.log(`server listening on http://localhost:${PORT}`)
  })
}
