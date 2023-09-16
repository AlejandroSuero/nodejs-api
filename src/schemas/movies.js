const z = require("zod")

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required"
  }),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  director: z.string(),
  duration: z.number().int().min(30).max(300),
  rate: z.number().min(0).max(10).default(5.0),
  poster: z.string().url({
    message: "Poster must be a valid URL"
  }),
  genre: z.array(z.enum([
    "Action",
    "Fantasy",
    "Adventure",
    "Sci-Fi",
    "Terror",
    "Crime",
    "Drama",
    "Thriller",
    "Comedy",
    "Horror"
  ]))
})

const validateMovie = (obj) => {
  return movieSchema.safeParse(obj)
}

const validatePartialMovie = (obj) => {
  return movieSchema.partial().safeParse(obj)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}