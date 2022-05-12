import { RouteAction, RouteParams } from './types'
import { parsePattern, stripTrailingSlash } from './utils'

export class Route {
  pattern: string
  catchAll: boolean
  regExp: RegExp | undefined
  keys: string[] | undefined

  constructor(public path: string, public action: RouteAction) {
    path = stripTrailingSlash(path)
    this.pattern = path
    this.catchAll = path === '*'

    const { regExp, keys } = parsePattern(path) || {}
    this.regExp = regExp
    this.keys = keys
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
