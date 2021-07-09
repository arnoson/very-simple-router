import { stripTrailingSlash } from './utils'
import { Route, RouteAction, RouteParams } from './Route'

export interface RouteObject {
  path: string
  pattern: string
  params: RouteParams
  matched: boolean
}

export interface RouteDefinition {
  path: string
  action: RouteAction
}

export interface RouterOptions {
  routes?: RouteDefinition[]
  scrollRestoration?: ScrollRestoration
}

export type BeforeEachHandler = (
  to: RouteObject,
  from: RouteObject
) => any | Promise<any>

export type AfterEachHandler = (
  to: RouteObject,
  from: RouteObject
) => any | Promise<any>

export class Router {
  routes: Route[] = []
  currentRoute: RouteObject

  private _beforeEachHandlers = [] as BeforeEachHandler[]
  private _afterEachHandlers = [] as AfterEachHandler[]

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

  beforeEach(handler: BeforeEachHandler) {
    this._beforeEachHandlers.push(handler)
  }

  afterEach(handler: AfterEachHandler) {
    this._afterEachHandlers.push(handler)
  }

  use(middleware: { init?: () => any; beforeEach: BeforeEachHandler }) {
    middleware.init?.()
    this.beforeEach(middleware.beforeEach)
  }

  private _findRoute(path: string) {
    for (const route of this.routes) {
      const params = route.match(path)
      if (params) return { route, params }
    }
  }

  /**
   * Search for the first route that matches the path and call the routes
   * callback.
   */
  private async _handleChange(path: string, initial = false) {
    const { route, params } = this._findRoute(path) ?? {}

    const previousRoute = this.currentRoute
    this.currentRoute = {
      path,
      params,
      pattern: route?.pattern,
      matched: !!route,
    }

    for (const handler of this._beforeEachHandlers) {
      await handler(this.currentRoute, previousRoute)
    }

    await route?.action(params, initial)

    for (const handler of this._afterEachHandlers) {
      await handler(this.currentRoute, previousRoute)
    }
  }
}
