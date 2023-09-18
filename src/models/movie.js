import { randomUUID } from "node:crypto"

import { readJSON } from "../utils.js"

/**
 * @typedef {
*  "Action" |
*  "Fantasy" |
*  "Adventure" |
*  "Sci-Fi" |
*  "Terror" |
*  "Crime" |
*  "Drama" |
*  "Thriller" |
*  "Comedy" |
*  "Horror"
*  } Genre
 */

/**
 * @typedef {{
 *  id: string
 *  title: string
 *  director: string
 *  duration: number
 *  year: number
 *  genre: Genre[]
 *  poster: string
 *  rate?: number
 * }} Movie
 */

/**
 * @typedef {{
 *  title: string
 *  director: string
 *  duration: number
 *  year: number
 *  genre: Genre[]
 *  poster: string
 *  rate?: number
 * }} MovieData
 */

/** @type {Movie[]} */
const movies = readJSON("./movies.json")

export class MovieModel {
  /**
  * Get All movies by genre
  *
  * @param {{genre: string}} genre Movie genre to search
  * @returns {Promise<Movie[]>} If there is a genre, returns an array of movies with that
  * genre. Otherwise returns the movies
  */
  static async getAll({ genre }) {
    if (genre) {
      return movies.filter(
        movie => movie.genre.some(gen => gen.toLowerCase() === genre.toLowerCase())
      )
    }
    return movies
  }

  /**
  * Get movie by id
  *
  * @param {{id: string}} UUID of the movie to search
  * @returns {Promise<Movie[]>} The movie with that id
  */
  static async getById({ id }) {
    /** @type {number} */
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex < 0) { return [] }

    const movie = [movies[movieIndex]]
    return movie[0]
  }

  /**
  * Create a new movie and inserts the movie
  *
  * @param {MovieData} Movie data for the creation
  * @returns {Promise<Movie>} Created movie
  */
  static async create({ input }) {
    /** @type {Movie} */
    const newMovie = {
      id: randomUUID(),
      ...input
    }

    movies.push(newMovie)
    return newMovie
  }

  /**
  * Updates a movie by id and inserts the movie in the place
  *
  * @param {{id:string}} UUID of the movie for the update
  * @param {MovieData} Movie data for the updated fields
  * @returns {Promise<Movie>} Updated movie
  */
  static async update({ id, input }) {
    /** @type {number} */
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex < 0) { return null }

    /** @type {Movie} */
    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }

    const movie = [movies[movieIndex]]
    return movie[0]
  }

  /**
  * Delets a movie
  *
  * @param {{id: string}} UUID of the movie for deletion
  * @returns {Promise<Boolean>} Deleted movie
  */
  static async delete({ id }) {
    /** @type {number} */
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex < 0) { return [] }

    const movie = [movies[movieIndex]]
    movies.splice(movieIndex, 1)
    return movie[0]
  }
}
