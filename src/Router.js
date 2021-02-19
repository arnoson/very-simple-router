import { stripTrailingSlash } from './utils.js'
import { Route } from './Route.js'

export class Router {
  /**
   * @param {{ routes?: Array, scrollRestoration?: ScrollRestoration }} [options]
   */
  // @ts-ignore (typescript doesn't seem to like the empty `{}`)
  constructor({ routes = [], scrollRestoration = 'manual' } = {}) {
    /** @type {Array<Route>} */
    this.routes = []
    /** @type {{ path: string, params: object }} */
    this.currentRoute = null

    routes.forEach(({ path, action }) => this.route(path, action))
    window.history.scrollRestoration = scrollRestoration
    window.addEventListener('popstate', () =>
      this._handleChange(window.location.pathname)
    )
  }

  /**
   * Add a new route.
   * @param {string} path - A path or a pattern (e.g.: `/user/:id`).
   * @param {import("./Route").RouteAction} action A function that is called
   * when the route is entered. The route parameters are passed as object.
   */
  route(path, action) {
    this.routes.push(new Route(path, action))
  }

  /**
   * Push a new route.
   * @param {string} path
   */
  push(path) {
    window.history.pushState(null, null, stripTrailingSlash(path))
    this._handleChange(path)
  }

  /**
   * Replace current route with a new route.
   * @param {string} path
   */
  replace(path) {
    window.history.replaceState(null, null, stripTrailingSlash(path))
    this._handleChange(path)
  }

  init() {
    this._handleChange(window.location.pathname, true)
  }

  /**
   * Search for the first route that matches the path and call the routes
   * callback.
   * @private
   * @param {string} path
   * @param {boolean} initial
   */
  _handleChange(path, initial = false) {
    for (const route of this.routes) {
      const params = route.match(path)
      if (params) {
        this.currentRoute = { path, params }
        route.action(params, initial)
        break
      }
    }
  }
}
