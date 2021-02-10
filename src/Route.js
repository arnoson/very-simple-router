import { stripTrailingSlash } from './utils.js'

/**
 * @typedef {Object<string, string>} RouteParams
 */

/**
 * @typedef {(params: RouteParams) => any} RouteAction
 */

/**
 * @private
 */
export class Route {
  /**
   * @param {string} path
   * @param {RouteAction} action
   */
  constructor(path, action) {
    path = stripTrailingSlash(path)

    this.path = path
    this.action = action
    this.catchAll = path === '*'

    const { regExp, keys } = this._parsePattern(path) || {}
    this.regExp = regExp
    this.keys = keys
  }

  /**
   * @private
   * @param {string} pattern
   * @returns {{ keys: Array<string>, regExp: RegExp }}
   */
  _parsePattern(pattern) {
    const keys = pattern.match(/(:[^/]+)/g)?.map(name => name.substr(1))
    return (
      keys && {
        keys,
        regExp: new RegExp('^' + pattern.replace(/(:[^/]+)/g, '([^/]+)') + '$')
      }
    )
  }

  /**
   * @param {string} path
   * @returns {RouteParams | undefined}
   */
  match(path) {
    return (
      path !== undefined &&
      (this.regExp
        ? this._getParams(path.match(this.regExp))
        : (this.catchAll || path === this.path) && {})
    )
  }

  /**
   * @private
   * @param {Array<string>} match
   * @return {RouteParams | undefined}
   */
  _getParams(match) {
    if (match) {
      /** @type {RouteParams} */
      const params = {}
      this.keys.forEach(
        // The first element in `match` contains the whole string so we have to
        // offset the index by 1.
        (key, index) => (params[key] = match[index + 1])
      )
      return params
    }
  }
}
