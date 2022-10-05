import { emit, off, on } from './events'
import { Route, RouteAction, RouteDefinition, RouteTrigger } from './types'
import { getParams, parsePattern, stripTrailingSlash } from './utils'

const routeDefinitions: RouteDefinition[] = []
let currentRoute: Route | undefined

const findDefinition = (path: string) => {
  for (const definition of routeDefinitions) {
    const { pattern, regExp, keys } = definition

    const match = regExp
      ? path.match(regExp)
      : pattern === '*' || pattern === path

    if (match) {
      const params = Array.isArray(match) ? getParams(match, keys) : undefined
      return { definition, params }
    }
  }
}

const handleChange = async (path: string, trigger: RouteTrigger) => {
  const result = findDefinition(path)
  const matches = !!result
  const params = result?.params ?? {}

  const previousRoute = currentRoute
  currentRoute = { path, params, matches, trigger }

  await emit('before-route', currentRoute, previousRoute)
  await result?.definition.action(params, currentRoute, previousRoute)
  await emit('route', currentRoute, previousRoute)
}

export default {
  get currentRoute() {
    return currentRoute
  },

  on,
  off,

  start({ handleInitial = true } = {}) {
    handleInitial && handleChange(window.location.pathname || '/', 'init')
    window.addEventListener('popstate', () =>
      handleChange(window.location.pathname, 'popstate')
    )
  },

  route(path: string, action: RouteAction) {
    const pattern = stripTrailingSlash(path)
    const { regExp, keys = [] } = parsePattern(path) || {}
    routeDefinitions.push({ pattern, action, regExp, keys })
  },

  push(path: string) {
    window.history.pushState(null, '', stripTrailingSlash(path))
    handleChange(path, 'push')
  },

  replace(path: string) {
    window.history.replaceState(null, '', stripTrailingSlash(path))
    handleChange(path, 'replace')
  },
}
