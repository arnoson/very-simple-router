export type RouteTrigger = 'init' | 'push' | 'replace' | 'popstate'

export type RouteParams = Record<string, string>

export type RouteAction = (params: RouteParams, to: Route, from?: Route) => any

export type RouteEvent = 'before-route' | 'route'

export interface RouteDefinition {
  pattern: string
  keys: string[]
  regExp?: RegExp
  action: RouteAction
}

export interface Route {
  path: string
  params: RouteParams
  matches: boolean
  trigger: RouteTrigger
}

export type RouteEventHandler = (to: Route, from?: Route) => any | Promise<any>
