import { describe, it, expect, vi } from 'vitest'
import { RouteObject } from '../src'
import { Route } from '../src/Route'

import { Router } from '../src/Router'

const flushPromises = () => new Promise(setImmediate)

const navigateToPath = (path: string) => {
  Object.defineProperty(window, 'location', {
    value: { pathname: path },
    writable: true,
  })
  window.dispatchEvent(new PopStateEvent('popstate'))
}

describe('Router', () => {
  it('handles the initial route', async () => {
    const router = new Router()

    const action = vi.fn()
    router.route('/', action)

    router.start()
    await flushPromises()

    expect(action).toBeCalledWith(
      {},
      expect.objectContaining({ trigger: 'init' }),
      undefined
    )
  })

  it('pushes a new route', () => {
    const router = new Router()
    window.history.pushState = vi.fn()
    router.push('/path')
    expect(window.history.pushState).toBeCalledWith(null, '', '/path')
  })

  it('replaces the current route with a new route', () => {
    const router = new Router()
    window.history.replaceState = vi.fn()
    router.replace('/path')
    expect(window.history.replaceState).toBeCalledWith(null, '', '/path')
  })

  it('adds a new route', () => {
    const router = new Router()
    const path = '/path'
    const action = () => {}
    router.route(path, action)

    const createdRoute = router.routes[0]
    expect(createdRoute).toBeInstanceOf(Route)
    expect(createdRoute).toMatchObject({ path, action })
  })

  it(`matches a route and calls it's callback`, async () => {
    const router = new Router()
    const action = vi.fn()
    router.route('/path/:param', action)
    router.start(false)

    navigateToPath('/path/test')
    await flushPromises()

    const params = { param: 'test' }
    const route: RouteObject = {
      path: '/path/test',
      params,
      pattern: '/path/:param',
      matches: true,
      trigger: 'popstate',
    }

    expect(action).toBeCalledWith(params, route, undefined)
  })

  it('catches unresolved routes', async () => {
    const router = new Router()
    const action = vi.fn()

    router.route('/path', () => {})
    router.route('*', action)
    router.start()

    navigateToPath('/does-not-exist')
    await flushPromises()

    expect(action).toBeCalled()
  })

  it('calls hook before route', async () => {
    const router = new Router()
    router.route('/', () => {})
    router.start(false)

    const callback = vi.fn()
    router.on('before-route', callback)

    navigateToPath('/')
    await flushPromises()

    const to: RouteObject = {
      path: '/',
      params: {},
      pattern: '/',
      matches: true,
      trigger: 'popstate',
    }
    const from = undefined
    expect(callback).toBeCalledWith(to, from)
  })

  // it('calls hook after route', async () => {
  //   const router = new Router()
  //   router.route('/', () => {})

  //   const callback = vi.fn()
  //   router.on('route', callback)

  //   navigateToPath('/')

  //   // // The route action can be async (even if it isn't in this case). Therefore
  //   // // we have to flush all promises before testing.
  //   // await flushPromises()

  //   const route = { path: '/', params: {}, pattern: '/', matched: true }
  //   expect(callback).toBeCalledWith(route, undefined)
  // })
})
