/**
 * Remove a trailing slash from an url if its not root url (`/`).
 * @param {string} str
 */
export const stripTrailingSlash = str =>
  str.length > 1 && str.endsWith('/') ? str.slice(0, -1) : str
