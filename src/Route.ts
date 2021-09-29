import { stripTrailingSlash } from './utils'

export type RouteParams = Record<string, string>

export type RouteAction = (params: RouteParams, initial?: boolean) => any

export class Route {
  pattern: string
  catchAll: boolean
  regExp: RegExp
  // TODO: what type?
  keys: any

  constructor(public path: string, public action: RouteAction) {
    path = stripTrailingSlash(path)
    this.pattern = path
    this.catchAll = path === '*'

    const { regExp, keys } = this._parsePattern(path) || {}
    this.regExp = regExp
    this.keys = keys
  }

  private _parsePattern(pattern: string): {
    keys: Array<string>
    regExp: RegExp
  } {
    const keys = pattern.match(/(:[^/]+)/g)?.map((name) => name.substr(1))
    return (
      keys && {
        keys,
        regExp: new RegExp('^' + pattern.replace(/(:[^/]+)/g, '([^/]+)') + '$'),
      }
    )
  }

  match(path: string): RouteParams {
    return (
      path !== undefined &&
      (this.regExp
        ? this._getParams(path.match(this.regExp))
        : (this.catchAll || path === this.path) && {})
    )
  }

  _getParams(match: string[]) {
    if (match) {
      const params: RouteParams = {}
      this.keys.forEach(
        // The first element in `match` contains the whole string so we have to
        // offset the index by 1.
        (key: string, index: number) => (params[key] = match[index + 1])
      )
      return params
    }
  }
}
