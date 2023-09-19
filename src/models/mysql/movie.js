import mysql from "mysql2/promise"
import crypto from "node:crypto"

const DEFAULT_CONFIG = {
  host: "localhost",
  user: "root",
  port: 3306,
  password: "",
  database: "moviesDB"
}

const CONNECTION_CONFIG = process.env.DATABASE_URL ?? DEFAULT_CONFIG
const connection = await mysql.createConnection(CONNECTION_CONFIG)

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
 *  "Horror" |
 *  "Romance" |
 *  "Animation" |
 *  "Biography"
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
export class MovieModel {
  /**
   * Sets the genres to a movie to display it as an array
   *
   * @param {Movie[]} movies Array containing the movies to set genre
   */
  static async setGenres(movies) {
    const sql = `SELECT genre.name, BIN_TO_UUID(movie_genres.movie_id) as id
FROM genre
JOIN movie_genres ON genre.id = movie_genres.genre_id;`
    const [genresTable] = await connection.query(sql)
    movies.forEach((movie, index) => {
      movie.genre = []
      genresTable.forEach(data => {
        if (movie.id === data.id) {
          movie.genre.push(data.name)
        }
      })
      movies[index] = movie
    })
  }

  /**
  * Get All movies by genre
  *
  * @param {{genre: string}} genre Movie genre to search
  * @returns {Promise<Movie[]>} If there is a genre, returns an array of movies with that
  * genre. Otherwise returns the movies
  */
  static async getAll({ genre }) {
    if (genre) {
      const sql = "SELECT id, name FROM genre WHERE LOWER(name) = ?;"
      const lowerCaseGenre = genre.toLowerCase()
      const [genres] = await connection.query(sql, [lowerCaseGenre])

      if (genres.length === 0) return []

      const [{ id }] = genres

      const joinSQL = `
SELECT BIN_TO_UUID(movie.id) id, movie.title, movie.director, movie.year, movie.duration, movie.poster, movie.rate
FROM movie
INNER JOIN movie_genres ON movie_genres.movie_id = movie.id
INNER JOIN genre ON movie_genres.genre_id = genre.id
WHERE genre.id = ?
GROUP BY movie.id;
  `
      const [movies] = await connection.query(joinSQL, [id])
      await this.setGenres(movies)

      return movies
    }
    const sql = "SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie;"
    const [movies] = await connection.query(sql)
    try {
      await this.setGenres(movies)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating genres")
    }

    return movies
  }

  /**
  * Get movie by id
  *
  * @param {{id: string}} UUID of the movie to search
  * @returns {Promise<Movie>} The movie with that id
  */
  static async getById({ id }) {
    const sql = `
      SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate
      FROM movie
      WHERE id = UUID_TO_BIN(?);
    `
    const [movies] = await connection.query(sql, [id])

    if (movies.length === 0) return []
    try {
      await this.setGenres(movies)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating genres")
    }

    return movies[0]
  }

  /**
  * Create a new movie and inserts the movie
  *
  * @param {MovieData} Movie data for the creation
  * @returns {Promise<Movie>} Created movie
  */
  static async create({ input }) {
    const {
      genre,
      title,
      director,
      year,
      duration,
      poster,
      rate
    } = input
    const [uuidResult] = await connection.query("SELECT UUID() uuid;")
    let [{ uuid }] = uuidResult
    const [uuidFromDB] = await connection.query("SELECT BIN_TO_UUID(id) id FROM movie WHERE id = UUID_TO_BIN(?)", uuid)
    if (uuidFromDB.length > 0) {
      if (uuid === uuidFromDB[0].id) uuid = crypto.randomUUID()
    }

    const sql = `INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES
(UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`
    try {
      await connection.query(sql, [uuid, title, year, director, duration, poster, rate])
    } catch (e) {
      console.error(e)
      throw new Error("Error while creating movie")
    }

    const movieSQL = `SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate
FROM movie WHERE id = UUID_TO_BIN(?);`
    const [movies] = await connection.query(movieSQL, [uuid])
    const colsToUpdate = []
    let insertSQL = "INSERT INTO movie_genres (movie_id, genre_id) VALUES"
    genre.forEach(async (genre) => {
      insertSQL += `
      ((SELECT id FROM movie WHERE title = '${movies[0].title}'), (SELECT id FROM genre WHERE LOWER(name) = ?)),`
      colsToUpdate.push(genre.toLowerCase())
    })
    insertSQL = `${insertSQL.slice(0, -1)};`
    try {
      await connection.query(insertSQL, colsToUpdate)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating movie_genres")
    }
    try {
      await this.setGenres(movies)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating genres")
    }
    const [movie] = movies

    return movie
  }

  /**
  * Updates a movie by id and inserts the movie in the place
  *
  * @param {{id:string}} UUID of the movie for the update
  * @param {MovieData} Movie data for the updated fields
  * @returns {Promise<Movie>} Updated movie
  */
  static async update({ id, input }) {
    let sql = "UPDATE movie SET "
    const colsToUpdate = []
    for (const key in input) {
      sql += `${key} = ?,`
      colsToUpdate.push(input[key])
    }
    sql = sql.slice(0, -1)
    sql += " WHERE id = UUID_TO_BIN(?);"
    colsToUpdate.push(id)
    try {
      await connection.query(sql, colsToUpdate)
    } catch (e) {
      console.error(e)
      throw new Error("Error ocurred while updating movie")
    }
    const movie = await this.getById({ id })
    const movies = [movie]
    try {
      await this.setGenres(movies)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating genres")
    }
    return movies[0]
  }

  /**
  * Delets a movie
  *
  * @param {{id: string}} UUID of the movie for deletion
  * @returns {Promise<Boolean>} Deleted movie
  */
  static async delete({ id }) {
    const sql = "DELETE FROM movie WHERE id = UUID_TO_BIN(?)"
    const movie = await this.getById({ id })
    if (movie.toString() === "") return []
    console.log("movie", movie.toString())

    const movies = [movie]
    try {
      await this.setGenres(movies)
    } catch (e) {
      console.error(e)
      throw new Error("Error while relating genres")
    }
    try {
      await connection.query(sql, [id])
    } catch (e) {
      console.error(e)
      throw new Error("Error ocurred while deleting movie")
    }
    const movieGenreSQL = "DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)"
    try {
      await connection.query(movieGenreSQL, [id])
    } catch (e) {
      console.error(e)
      throw new Error("Error ocurred while deleting movie_genres")
    }
    return movies[0]
  }
}
