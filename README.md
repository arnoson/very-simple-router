# Very Simple Router

A very simple dependency-free router written in typescript. You can use it to build
lightweight SPAs or enhance your traditional multi page websites.

## Installation

### Npm

`npm install @very-simple/router`

## Usage

### Add routes and start the router

```js
import router from '@very-simple/router'

router.route('/', () => console.log('Home'))
router.route('/about', () => console.log('About'))
router.route('/projects/:id', ({ id }) => console.log(`Show project ${id}`))
router.route('*', () => console.log('Not found!'))

// Start listening to history navigation events and handle the initial route.
// If you don't want to handle the initial route use `router.start(false)`.
router.start()
```

### Handle Link Navigation:

```html
<a class="router-link" href="/">Home</a>
<a class="router-link" href="/about">About</a>
<a class="router-link" href="/projects/test">This one project</a>
```

To prevent the links from actually changing the page we have to intercept the
click events and push/replace a route instead.

```js
document.querySelectorAll('a.router-link').forEach((el) =>
  el.addEventListener('click', (event) => {
    event.preventDefault()
    router.push(el.getAttribute('href'))
  })
)
```

## Documentation

### Start

```js
router.start() // Use `start(false)` to ignore the initial route.
```

### Push a new Route

```js
router.push('/path/to/something')
```

### Replace the current Route

```js
router.replace('/path/to/something')
```

### Add a new Route

```js
router.route('/path', (params, to, from) => {
  // Do something ...
})
```

`to` and `from` are `RouteObjects`:

```ts
interface RouteObject {
  // The actual path (`hello/world`)
  path: string

  // The pattern used in `router.route()` (`hello/:name`)
  pattern?: string

  // All dynamic path segments ({ name: 'world' })
  params: Record<string, string>

  // Wether or not a route matched. This is obviously the case if you receive
  // this in a route's callback, but can be useful if you are using
  // `router.currentRoute`.
  matches: boolean

  // What caused the route.
  trigger: 'init' | 'push' | 'replace' | 'popstate'
}
```

You can handle the initial route differently (e.g.: no smooth scrolling):

```js
router.route('projects/:id', (params, route) => {
  const isInitial = route.trigger === 'init'
  const el = document.getElementById(params.id)
  el.scrollIntoView({ behavior: isInitial ? 'auto' : 'smooth' })
})
```

Or differentiate between manual push/replace navigation and the browser's
back/forward buttons:

```js
router.route('data/:url', (params, route) => {
  const shouldUseCache = route.trigger === 'popstate'
  if (shouldUseCache) {
    // use cached data
  } else {
    // fetch new data
  }
})
```

### Add a new Dynamic Route

You can use one or more dynamic segments (denoted by a colon `:`). The dynamic
segments will then be available in the route's action callback.

```js
const action = (params) => {
  console.log(`Hello ${params.firstName} ${params.lastName}!`)
}
router.route('/user/:firstName/:lastName', action)
```

### Use the current Route

Use the current route anywhere in your project:

```js
import router from './router.js'

window.addEventListener('click', () => {
  if (router.currentRoute.path === '/') {
    console.log('Welcome home!')
  } else {
    console.log(`Welcome ${router.currentRoute.params.name}`)
  }
})
```

### Catch all / 404 Not found Route

You can use the asterisk `*` to match any route that is not matched by a
previous route. See [important](#important) for the asterisk's limitations.

```js
router.route('*', () => console.log('Not found!'))
```

### Hooks

Execute a callback before or after each route. This are simple hooks, no navigation guards. So you can't use them to redirect or cancel routes. The callbacks receive the new and the previous route.

```js
// Gets called before the to route's action is called.
router.on('before-route', (to, from) => console.log(`Changing to: ${to.path}`))

// Gets called after the to route's action is called.
router.on('route', (to, from) =>
  console.log(`Changed to: ${to.path} from: ${from.path}`)
)
```

## Important

- the router uses HTML5 history mode only, so make sure your server is
  setup correctly (see vue router's [explanation](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations)).
- The asterisk `*` can only be used to catch all routes. It is not possible to
  use it like this `'/user-*'`.
