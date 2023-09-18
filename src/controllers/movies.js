import { MovieModel } from "../models/mysql/movie.js"
import { validateMovie, validatePartialMovie } from "../schemas/movies.js"

export class MovieController {
  /**
  * Get all movies by genre from the query parameters and sends a response
  */
  static async getAll(req, res) {
    const { genre } = req.query
    const movies = await MovieModel.getAll({ genre })
    res.json(movies)
  }

  /**
  * Gets a movie by id from the endpoint and sends a response
  */
  static async getById(req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById({ id })
    if (movie.length !== 0) return res.json(movie)

    res.status(404).json({ message: "Movie not found" })
  }

  /**
  * Creates a new movie if validations are correct and sends a response
  */
  static async create(req, res) {
    const result = validateMovie(req.body)

    if (result.error) {
      res.status(422).json({ error: JSON.parse(result.error.message) })
    }
    const newMovie = await MovieModel.create({ input: result.data })

    res.status(201).json(newMovie)
  }

  /**
  * Updates a movie with the id from the endpoint and the data from the body
  * and sends a response
  */
  static async update(req, res) {
    const result = validatePartialMovie(req.body)

    if (result.error) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updateMovie = await MovieModel.update({ id, input: result.data })
    if (updateMovie === null) { return res.status(404).json({ message: "Movie not found" }) }

    res.json(updateMovie)
  }

  /**
  * Deletes a movie with the id from the endpoint and sends a response
  */
  static async delete(req, res) {
    const { id } = req.params
    const movieDeleted = await MovieModel.delete({ id })

    if (!movieDeleted) { return res.status(404).json({ message: "Movie not found" }) }

    return res.json({ message: "Movie deleted" })
  }
}
