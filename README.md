# Very Tiny Router

A simple vanilla js router written in modern javascript. You can use it to build
lightweight SPAs or enhance your traditional multi page websites.

## Installation

### Npm

`npm install very-tiny-router`

### Manual

You can also include `very-tiny-router` directly in the browser. Download this
repository and place it in the root folder of your website. Then you can either
use a iife:

```html
<script src="./very-tiny-router/dist/index.iife.js"></script>
<script>
  const router = new Router()
</script>
```

or a javascript module:

```html
<script type="module">
  import Router from './very-tiny-router/dist/index.esm.js'
</script>
```

## Usage

### Create a new Router and add Routes:

```js
import Router from 'very-tiny-router'

const router = new Router()
router.route('/', () => console.log('Home'))
router.route('/about', () => console.log('About'))
router.route('/projects/:id', ({ id }) => console.log(`Show project ${id}`))
router.route('*', () => console.log('Not found!'))

// In most cases, you probably want the router to handle the initial route.
router.push(window.location.pathname)
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
document.querySelectorAll('a.router-link').forEach(el =>
  el.addEventListener('click', event => {
    event.preventDefault()
    router.push(el.getAttribute('href'))
  })
)
```

## Documentation

### Configuration

You can define the routes directly when creating the router (or use the
[`route()`](#add-a-new-route) method) and set the history scrollRestoration.

```js
const router = new Router({
  routes: [
    { path: '/', action: () => console.log('Home') },
    { path: '/user/:name', action: ({ name }) => console.log(`Hello ${id}!`) }
  ],
  scrollRestoration: 'auto' // default is 'manual'
})
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
router.route('/path', () => {
  // Do something ...
})
```

### Add a new Dynamic Route

You can use one or more dynamic segments (denoted by a colon `:`). The dynamic
segments will then be available in the route's action callback.

```js
const action = params => {
  console.log(`Hello ${params.firstName} ${params.lastName}!`)
}
router.route('/user/:firstName/:lastName', action)
```

### Use the current Route

You can also use the current route anywhere in your project:

```js
// router.js
import Router from 'very-tiny-router'
export default const router = new Router({
  routes: [
    { path: '/', () => { /* ... */ } },
    { path: '/user/:name', () => { /* ... */ } }
  ]
})
```

```js
// another-file.js
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

## Important

- `very-tiny-router` uses HTML5 history mode only, so make sure your server is
  setup correctly (see vue router's [explanation](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations)).
- The asterisk `*` can only be used to catch all routes. It is not possible to
  use it like this `'/user-*'`.
