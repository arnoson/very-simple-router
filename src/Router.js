import { stripTrailingSlash } from './utils.js'
import { Route } from './Route.js'

/** @typedef {{ path: string, pattern: string, params: object }} RouteObject */

export class Router {
  /**
   * @param {{ routes?: Array, scrollRestoration?: ScrollRestoration }} [options]
   */
  // @ts-ignore (typescript doesn't seem to like the empty `{}`)
  constructor({ routes = [], scrollRestoration = 'manual' } = {}) {
    /** @type {Array<Route>} */
    this.routes = []
    /** @type {RouteObject} */
    this.currentRoute = null

    this._handleBeforeEach = null
    this._handleAfterEach = null

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
   * @param {(route: RouteObject) => any?} callback
   */
  beforeEach(callback) {
    this._handleBeforeEach = callback
  }

  /**
   * @param {(route: RouteObject) => any?} callback
   */
  afterEach(callback) {
    this._handleAfterEach = callback
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
        const { pattern } = route
        this.currentRoute = { path, pattern, params }

        this._handleBeforeEach?.(this.currentRoute)

        const result = route.action(params, initial)
        if (result instanceof Promise) {
          result.then(() => this._handleAfterEach?.(this.currentRoute))
        } else {
          this._handleAfterEach?.(this.currentRoute)
        }
        break
      }
    }
  }
}
