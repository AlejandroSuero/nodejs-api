# NodeJS REST API

A REST API using NodeJS and Express.

In this I am going to create an API to display, update, post and delete movies.

## Installation

You can use whatever package manager that you want. I am going to show it with
npm.

```bash
# Using -E to install exact version (best practice for production dependencies)
npm install express zod -E

# Dev dependencies
npm install -D eslint
```

### Eslint configuration (optional)

In my case a like to use a separate file for the linter, in this case
```.eslintrc.json``` and ```.eslintignore```.

I like using standar as a base configuration.

```bash
npm init @eslint/config
# After hitting <enter> select how you want it to be configured
```

## Usage

As I am using the REST arquitecture every resource is an endpoint. In this case
```movies``` is the resource and the specific **movie** is going to be another
endpoint.

### Endpoints

- [x] http://localhost:<PORT>/movies
- [x] http://localhost:<PORT>/movies/:id

In the case there is a need for filtering a genre in the list of movies, we could
treat it as another resource but in this case is going to be a query paramater
to filter.

- [x] http://localhost:<PORT>/movies?genre=<genre-to-search>
