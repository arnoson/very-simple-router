export type RouteTrigger = 'init' | 'push' | 'replace' | 'popstate'

export type RouteParams = Record<string, string>

export type RouteAction = (
  params: RouteParams,
  to: RouteObject,
  from?: RouteObject
) => any

export type RouteEvent = 'before-route' | 'route'

export interface RouteObject {
  path: string
  pattern?: string
  params: RouteParams
  matches: boolean
  trigger: RouteTrigger
}

export interface RouteDefinition {
  path: string
  action: RouteAction
}

export type RouteEventHandler = (
  to: RouteObject,
  from?: RouteObject
) => any | Promise<any>
