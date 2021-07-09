/**
 * Remove a trailing slash from an url if its not root url (`/`).
 */
export const stripTrailingSlash = (str: string) =>
  str.length > 1 && str.endsWith('/') ? str.slice(0, -1) : str
