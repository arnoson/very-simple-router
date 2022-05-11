import { stripTrailingSlash } from './utils'
import { Route, RouteAction, RouteParams } from './Route'

export interface RouteObject {
  path: string
  pattern?: string
  params: RouteParams
  matches: boolean
  initial: boolean
}

export interface RouteDefinition {
  path: string
  action: RouteAction
}

export interface RouterOptions {
  routes?: RouteDefinition[]
  scrollRestoration?: ScrollRestoration
}

export type RouteEvent = 'before-route' | 'route'

export type RouteEventHandler = (
  to: RouteObject,
  from?: RouteObject,
  initial?: boolean
) => any | Promise<any>

export class Router {
  routes: Route[] = []
  currentRoute: RouteObject | undefined

  private _handlers = {} as Record<string, RouteEventHandler[]>

  constructor({
    routes = [],
    scrollRestoration = 'manual',
  }: RouterOptions = {}) {
    routes.forEach(({ path, action }) => this.route(path, action))
    window.history.scrollRestoration = scrollRestoration
    window.addEventListener('popstate', () =>
      this.handleChange(window.location.pathname)
    )
  }

  on(event: RouteEvent, handler: RouteEventHandler) {
    this._handlers[event] ??= []
    this._handlers[event].push(handler)
  }

  off(event: RouteEvent, handler: RouteEventHandler) {
    this._handlers[event]?.splice(this._handlers[event].indexOf(handler), 1)
  }

  async emit(event: RouteEvent, to: RouteObject, from?: RouteObject) {
    for (const handler of this._handlers[event] ?? []) {
      await handler(to, from)
    }
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
    window.history.pushState(null, '', stripTrailingSlash(path))
    this.handleChange(path)
  }

  /**
   * Replace current route with a new route.
   */
  replace(path: string) {
    window.history.replaceState(null, '', stripTrailingSlash(path))
    this.handleChange(path)
  }

  init() {
    this.handleChange(window.location.pathname || '/', true)
  }

  private findRoute(path: string) {
    for (const route of this.routes) {
      const params = route.match(path)
      if (params) return { route, params }
    }
  }

  /**
   * Search for the first route that matches the path and call the routes
   * callback.
   */
  private async handleChange(path: string, initial = false) {
    const { route, params = {} } = this.findRoute(path) ?? {}

    const previousRoute = this.currentRoute
    this.currentRoute = {
      path,
      params,
      pattern: route?.pattern,
      matches: !!route,
      initial,
    }

    await this.emit('before-route', this.currentRoute, previousRoute)
    await route?.action(params, initial)
    await this.emit('route', this.currentRoute, previousRoute)
  }
}
