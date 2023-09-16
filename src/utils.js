import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/**
 * @param {string} path Path to the ```*.json``` file
 * @returns {NodeRequire} Returns a ```*.json``` file
 */
export const readJSON = (path) => require(path)
