/**
 * Remove a trailing slash from an url if its not root url (`/`).
 */
export const stripTrailingSlash = (str: string) =>
  str.length > 1 && str.endsWith('/') ? str.slice(0, -1) : str

interface ParsedPattern {
  keys: Array<string>
  regExp: RegExp
}

export const parsePattern = (pattern: string): ParsedPattern | undefined => {
  const keys = pattern.match(/(:[^/]+)/g)?.map((name) => name.substring(1))
  return (
    keys && {
      keys,
      regExp: new RegExp('^' + pattern.replace(/(:[^/]+)/g, '([^/]+)') + '$'),
    }
  )
}
