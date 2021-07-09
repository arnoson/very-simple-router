import { stripTrailingSlash } from './utils'
import { Route, RouteAction, RouteParams } from './Route'

export interface RouteObject {
  path: string
  pattern: string
  params: RouteParams
}

export interface RouteDefinition {
  path: string
  action: RouteAction
}

export interface RouterOptions {
  routes?: RouteDefinition[]
  scrollRestoration?: ScrollRestoration
}

export class Router {
  routes: Route[] = []
  currentRoute: RouteObject

  private _handleBeforeEach: (route: RouteObject) => any
  private _handleAfterEach: (route: RouteObject) => any

  constructor({
    routes = [],
    scrollRestoration = 'manual',
  }: RouterOptions = {}) {
    routes.forEach(({ path, action }) => this.route(path, action))
    window.history.scrollRestoration = scrollRestoration
    window.addEventListener('popstate', () =>
      this._handleChange(window.location.pathname)
    )
  }

  /**
   * Add a new route.
   * @param path - A path or a pattern (e.g.: `/user/:id`).
   * @param action - A function that is called when the route is entered. The
   * route parameters are passed as an object.
   */
  route(path: string, action: RouteAction) {
    this.routes.push(new Route(path, action))
  }

  /**
   * Push a new route.
   */
  push(path: string) {
    window.history.pushState(null, null, stripTrailingSlash(path))
    this._handleChange(path)
  }

  /**
   * Replace current route with a new route.
   */
  replace(path: string) {
    window.history.replaceState(null, null, stripTrailingSlash(path))
    this._handleChange(path)
  }

  init() {
    this._handleChange(window.location.pathname, true)
  }

  beforeEach(callback: (route: RouteObject) => any) {
    this._handleBeforeEach = callback
  }

  afterEach(callback: (route: RouteObject) => any) {
    this._handleAfterEach = callback
  }

  /**
   * Search for the first route that matches the path and call the routes
   * callback.
   */
  private _handleChange(path: string, initial = false) {
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
