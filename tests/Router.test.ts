import { describe, it, expect, vi } from 'vitest'
import router from '../src'
import { Route } from '../src/types'

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
    window.history.pushState = vi.fn()
    router.push('/path')
    expect(window.history.pushState).toBeCalledWith(null, '', '/path')
  })

  it('replaces the current route with a new route', () => {
    window.history.replaceState = vi.fn()
    router.replace('/path')
    expect(window.history.replaceState).toBeCalledWith(null, '', '/path')
  })

  it(`matches a route and calls it's callback`, async () => {
    const action = vi.fn()
    router.route('/path/:param', action)

    navigateToPath('/old')
    navigateToPath('/path/new')
    await flushPromises()

    const params = { param: 'new' }

    const from: Route = {
      path: '/old',
      params: {},
      matches: false,
      trigger: 'popstate',
    }

    const to: Route = {
      path: '/path/new',
      params,
      matches: true,
      trigger: 'popstate',
    }

    expect(action).toBeCalledWith(params, to, from)
  })

  it('catches unresolved routes', async () => {
    const action = vi.fn()
    router.route('*', action)

    navigateToPath('/does-not-exist')
    await flushPromises()

    expect(action).toBeCalled()
  })

  it('calls hook before route', async () => {
    const callback = vi.fn()

    navigateToPath('/old')
    router.on('before-route', callback)
    navigateToPath('/new')
    await flushPromises()

    const from: Route = {
      path: '/old',
      params: {},
      matches: true,
      trigger: 'popstate',
    }

    const to: Route = {
      path: '/new',
      params: {},
      matches: true,
      trigger: 'popstate',
    }

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
