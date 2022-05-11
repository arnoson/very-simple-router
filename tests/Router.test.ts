import { describe, it, expect, vi } from 'vitest'

import { Router } from '../src/Router'
import { Route } from '../src/Route'

const flushPromises = () => new Promise(setImmediate)

const navigateToPath = (path: string) => {
  Object.defineProperty(window, 'location', {
    value: { pathname: path },
    writable: true,
  })
  window.dispatchEvent(new PopStateEvent('popstate'))
}

describe('Router', () => {
  it('creates a new instance', () => {
    const path = '/path'
    const action = () => {}
    const router = new Router({
      routes: [{ path, action }],
      scrollRestoration: 'manual',
    })

    expect(window.history.scrollRestoration).toBe('manual')
    const createdRoute = router.routes[0]
    expect(createdRoute).toBeInstanceOf(Route)
    expect(createdRoute).toMatchObject({ path, action })
  })

  it('handles the initial route', async () => {
    const router = new Router()

    const action = vi.fn()
    router.route('/', action)

    router.init()
    await flushPromises()

    expect(action).toBeCalledWith({}, true)
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

    navigateToPath('/path/test')
    await flushPromises()

    expect(action).toBeCalledWith({ param: 'test' }, false)
  })

  it('catches unresolved routes', async () => {
    const router = new Router()
    const action = vi.fn()

    router.route('/path', () => {})
    router.route('*', action)

    navigateToPath('/does-not-exist')
    await flushPromises()

    expect(action).toBeCalled()
  })

  it('calls hook before route', async () => {
    const router = new Router()
    router.route('/', () => {})

    const callback = vi.fn()
    router.on('before-route', callback)

    navigateToPath('/')
    await flushPromises()

    const to = {
      path: '/',
      params: {},
      pattern: '/',
      matches: true,
      initial: false,
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
