# universal-autoloader

Universal plugin, that use the _file system_ scan, to load in a server all routes in a directory.

Inspired by [elysia-autoload](https://github.com/kravetsone/elysia-autoload).

## Installation

```sh
yarn add universal-autoloader
```

## Usage example with [Hono](https://hono.dev)

### Register the Plugin

```ts
// /app.ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { autoloadRoutes } from 'universal-autoloader'

const port = +(process.env.PORT || 3000)

const app = await autoloadRoutes(new Hono(), {
  // Pattern to scan route files
  pattern: '**/*.ts',
  // Prefix to add to routes
  prefix: '/api',
  // Source directory of route files: use "relative" path
  routesDir: './src/api'
})

serve(
  {
    fetch: app.fetch,
    port
  },
  () => console.log(`Server running at http://localhost:${port}`)
)
```

### Create a Route

```ts
// /routes/index.ts
import type { Context } from 'hono'

export default (c: Context) => {
  return c.text('Hello World!')
}
```

### Directory Structure

Guide on how `universal-autoloader` matches routes:

```
├── app.ts
├── routes
│   ├── index.ts         // index routes
│   ├── posts
│   │   ├── index.ts
│   │   └── [id].ts      // dynamic params
│   ├── likes
│   │   └── [...].ts     // wildcard
│   ├── domains
│   │   ├── @[...]       // wildcard with @ prefix
│   │   │   └── index.ts
│   ├── frontend
│   │   └── index.tsx    // usage of tsx extension
│   ├── events
│   │   ├── (post).ts    // dynamic method
│   │   └── (get).ts
│   └── users.ts
└── package.json
```

- `/routes/index.ts` → `GET` `/`
- `/routes/posts/index.ts` → `GET` `/posts`
- `/routes/posts/[id].ts` → `GET` `/posts/:id`
- `/routes/users.ts` → `GET` `/users`
- `/routes/likes/[...].ts` → `GET` `/likes/*`
- `/routes/domains/@[...]/index.ts` → `GET` `/domains/@*`
- `/routes/frontend/index.tsx` → `GET` `/frontend`
- `/routes/events/(post).ts` → `POST` `/events`
- `/routes/events/(get).ts` → `GET` `/events`

### Options

| Key               | Type          | Default                        | Description                                                                    |
| ----------------- | ------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| pattern?          | string        | `**/*.{ts,tsx,js,jsx,mjs,cjs}` | [Glob patterns](https://en.wikipedia.org/wiki/Glob_(programming))              |
| prefix?           | string        | ` `                            | Prefix to be added to each route                                               |
| routesDir?        | string        | `./routes`                     | The folder where routes are located (use a *relative* path)                    |
| vite?             | ViteDevServer | _undefined_                    | Developer server instance of [Vite](https://vite.dev) to use SSR module loader |
| skipNoRoutes?     | boolean       | `false`                        | Skip the throw error when no routes are found                                  |
| skipImportErrors? | boolean       | `false`                        | Skip the import errors with the `default export` of a rotue file               |

## License

This project is licensed under the [MIT License](LICENSE).
