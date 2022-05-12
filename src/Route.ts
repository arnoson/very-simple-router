import { stripTrailingSlash } from './utils'

export type RouteParams = Record<string, string>

export type RouteAction = (params: RouteParams, initial?: boolean) => any

interface ParsedPattern {
  keys: Array<string>
  regExp: RegExp
}

export class Route {
  pattern: string
  catchAll: boolean
  regExp: RegExp | undefined
  keys: string[] | undefined

  constructor(public path: string, public action: RouteAction) {
    path = stripTrailingSlash(path)
    this.pattern = path
    this.catchAll = path === '*'

    const { regExp, keys } = this.parsePattern(path) || {}
    this.regExp = regExp
    this.keys = keys
  }

  private parsePattern(pattern: string): ParsedPattern | undefined {
    const keys = pattern.match(/(:[^/]+)/g)?.map((name) => name.substring(1))
    return (
      keys && {
        keys,
        regExp: new RegExp('^' + pattern.replace(/(:[^/]+)/g, '([^/]+)') + '$'),
      }
    )
  }

  match(path: string): RouteParams | false {
    return (
      path !== undefined &&
      (this.regExp
        ? this.getParams(path.match(this.regExp)) ?? false
        : (this.catchAll || path === this.path) && {})
    )
  }

  private getParams(match: string[] | null) {
    if (match) {
      const params: RouteParams = {}
      this.keys?.forEach(
        // The first element in `match` contains the whole string so we have to
        // offset the index by 1.
        (key: string, index: number) => (params[key] = match[index + 1])
      )
      return params
    }
  }
}
