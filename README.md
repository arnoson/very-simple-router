# Very Tiny Router

A simple and tiny vanilla js router written in modern javascript.

## Installation

### NPM

`npm install very-tiny-router`

### manual

You can also include very-tiny-router directly in the browser. Download this
repository and place it the root folder of your website. Than you can either
use a legacy iife:

```html
<script src="./very-tiny-router/dist/index.legacy.js"></script>
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

### Create a new router and add routes:

```js
const router = new Router()
router.route('/', () => console.log('Home'))
router.route('/about', () => console.log('About'))
router.route('/projects/:id', ({ id }) => console.log(`Show project ${id}`))
router.route('*', () => console.log('Not found!'))
```

### Handle link navigation:

```html
<a href="/">Home</a>
<a href="/">About</a>
<a href="/projects/test">This one project</a>
```

To prevent the links from actually changing the page we have to intercept the
click events and push/replace a route instead.

```js
document.querySelectorAll('a').forEach(el =>
  el.addEventListener('click', event => {
    event.preventDefault()
    router.push(el.getAttribute('href'))
  })
)
```

## Important

- `very-tiny-router` uses HTML5 history mode only, so make sure your server is
  setup correctly (see vue router's [explanation](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations)).
- The wildcard `*` can be only used to catch all routes. It is not possible to
  use it like this `'/user-*'`
