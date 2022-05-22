import { Route, RouteEvent, RouteEventHandler } from './types'

const handlers: Record<string, RouteEventHandler[]> = {}

export const on = (event: RouteEvent, handler: RouteEventHandler) => {
  handlers[event] ??= []
  handlers[event].push(handler)
}

export const off = (event: RouteEvent, handler: RouteEventHandler) => {
  handlers[event]?.splice(handlers[event].indexOf(handler), 1)
}

export const emit = async (event: RouteEvent, to: Route, from?: Route) => {
  for (const handler of handlers[event] ?? []) {
    await handler(to, from)
  }
}
