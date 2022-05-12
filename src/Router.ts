import { Route } from './Route'
import {
  RouteAction,
  RouteEvent,
  RouteEventHandler,
  RouteObject,
  RouteTrigger,
} from './types'
import { stripTrailingSlash } from './utils'

export class Router {
  routes: Route[] = []
  currentRoute: RouteObject | undefined

  private handlers = {} as Record<string, RouteEventHandler[]>

  start(handleInitial = true) {
    handleInitial && this.handleChange(window.location.pathname || '/', 'init')
    window.addEventListener('popstate', () =>
      this.handleChange(window.location.pathname, 'popstate')
    )
  }

  on(event: RouteEvent, handler: RouteEventHandler) {
    this.handlers[event] ??= []
    this.handlers[event].push(handler)
  }

  off(event: RouteEvent, handler: RouteEventHandler) {
    this.handlers[event]?.splice(this.handlers[event].indexOf(handler), 1)
  }

  async emit(event: RouteEvent, to: RouteObject, from?: RouteObject) {
    for (const handler of this.handlers[event] ?? []) {
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

  push(path: string) {
    window.history.pushState(null, '', stripTrailingSlash(path))
    this.handleChange(path, 'push')
  }

  replace(path: string) {
    window.history.replaceState(null, '', stripTrailingSlash(path))
    this.handleChange(path, 'replace')
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
  private async handleChange(path: string, trigger: RouteTrigger) {
    const { route, params = {} } = this.findRoute(path) ?? {}

    const previousRoute = this.currentRoute
    this.currentRoute = {
      path,
      params,
      pattern: route?.pattern,
      matches: !!route,
      trigger,
    }

    await this.emit('before-route', this.currentRoute, previousRoute)
    await route?.action(params, this.currentRoute, previousRoute)
    await this.emit('route', this.currentRoute, previousRoute)
  }
}
