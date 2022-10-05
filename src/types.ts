export type RouteTrigger = 'init' | 'push' | 'replace' | 'popstate'

export type RouteParams = Record<string, string>

export type RouteAction = (params: RouteParams, to: Route, from?: Route) => any

export type TypedRouteAction<T> = (
  params: ParseRouteParams<T>,
  to: Route,
  from?: Route
) => any

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

// Thanks, https://type-level-typescript.com !
export type ParseRouteParams<url> = url extends `${infer start}/${infer rest}`
  ? ParseRouteParams<start> & ParseRouteParams<rest>
  : url extends `:${infer param}`
  ? { [k in param]: string }
  : {}

export type RouteEventHandler = (to: Route, from?: Route) => any | Promise<any>
